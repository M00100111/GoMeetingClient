// webrtc.ts
import { websocketService } from './websocket'
import { MessageType, MessageMethod } from '@/types/message'
import { useRoomStore } from '@/store/room'
import { useUserInfoStore } from '@/store'

// 已实现WebRTC功能，需要完善以下功能：
// 已完成注册媒体流时根据会议室成员建立webrtc连接
// 待实现后续新成员加入时，需要处理

// 定义WebRtc服务类
class WebRTCMediaService {
  // WebSocket 连接实例，用于信令传输
  private socket: typeof websocketService
  // 存储所有对等连接的映射表，以用户ID为键
  private peerConnections: { [key: string]: RTCPeerConnection }
  // 本地媒体流（音视频）
  private combinedStream: MediaStream

  // 构造器
  constructor() {
    this.socket = websocketService
    this.peerConnections = {}
    // 初始化为空流而不是null
    this.combinedStream = new MediaStream()
    console.log('初始化组合流')
    console.log(this.combinedStream)
    // 注册处理函数到Ws
    this.initSocketListeners()
  }

  // 添加触发重新协商的方法
  private async triggerRenegotiation(pc: RTCPeerConnection) {
    try {
      // 查找对应的用户ID
      let targetUserId = ''
      for (const [userId, peerConnection] of Object.entries(this.peerConnections)) {
        if (peerConnection === pc) {
          targetUserId = userId
          break
        }
      }

      if (!targetUserId) {
        console.error('无法找到对应的用户ID')
        return
      }

      // 创建新的offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // 发送offer到远程端
      this.sendSignalMessage(MessageMethod.WebRTC_Offer_Method, {
        receiverId: targetUserId,
        offer: pc.localDescription
      })

      console.log('重新协商已触发，发送新的offer')
    } catch (error) {
      console.error('触发重新协商失败:', error)
    }
  }

  // 注册视频流（如摄像头流和屏幕流）,默认注册摄像头流
  registerVideoStream(videoStream: MediaStream, streamType: 'camera' | 'screen' = 'camera') {
    const userInfoStore = useUserInfoStore()
    const currentUserId = userInfoStore.userId
    const roomStore = useRoomStore()

    // 注册轨道到组合流
    videoStream.getVideoTracks().forEach((track) => {
      // 为轨道添加类型标识
      ;(track as any).streamType = streamType
      // 不再移除相同类型的旧轨道，允许同时存在多个视频轨道
      // 只在需要替换特定轨道时才移除
      this.combinedStream.addTrack(track)
    })

    // 遍历房间成员，为每个成员处理连接
    for (const userId of roomStore.roomMembers.keys()) {
      // 跳过当前用户自己
      if (userId === currentUserId) {
        continue
      }
      // 如果连接已存在，则添加轨道并触发重新协商
      if (this.peerConnections[userId]) {
        videoStream.getVideoTracks().forEach((track) => {
          const senderExists = this.peerConnections[userId]
            .getSenders()
            .some((sender) => sender.track === track)
          if (!senderExists) {
            try {
              this.peerConnections[userId].addTrack(track, this.combinedStream)
              console.log(`成功添加视频轨道(${streamType})到连接[${userId}]`)
              // 触发重新协商
              this.triggerRenegotiation(this.peerConnections[userId])
            } catch (error) {
              console.warn(`添加视频轨道(${streamType})到连接[${userId}]失败:`, error)
            }
          }
        })
      } else {
        // 如果连接不存在，则创建新的Offer
        this.createOffer(userId)
      }
    }

    console.log(`视频流(${streamType})已注册到组合流`)
    console.log(this.combinedStream)
  }

  // 复用注册摄像头流方法以注册屏幕流
  registerScreenStream(screenStream: MediaStream) {
    this.registerVideoStream(screenStream, 'screen')
  }

  // 注册音频流（如麦克风流和系统音频流）,默认注册麦克风流
  registerAudioStream(
    audioStream: MediaStream,
    streamType: 'microphone' | 'system_audio' = 'microphone'
  ) {
    const userInfoStore = useUserInfoStore()
    const currentUserId = userInfoStore.userId
    const roomStore = useRoomStore()

    // 遍历传入的音频流中的所有音频轨道
    audioStream.getAudioTracks().forEach((track) => {
      // 为轨道添加类型标识
      ;(track as any).streamType = streamType
      // 不再移除相同类型的旧轨道，允许同时存在多个音频轨道
      // 只在需要替换特定轨道时才移除
      this.combinedStream.addTrack(track)
    })

    // 遍历房间成员，为每个成员处理连接
    for (const userId of roomStore.roomMembers.keys()) {
      // 跳过当前用户自己
      if (userId === currentUserId) {
        continue
      }
      // 如果连接已存在，则添加轨道并触发重新协商
      if (this.peerConnections[userId]) {
        audioStream.getAudioTracks().forEach((track) => {
          const senderExists = this.peerConnections[userId]
            .getSenders()
            .some((sender) => sender.track === track)
          if (!senderExists) {
            try {
              this.peerConnections[userId].addTrack(track, this.combinedStream)
              console.log(`成功添加音频轨道(${streamType})到连接[${userId}]`)
              // 触发重新协商
              this.triggerRenegotiation(this.peerConnections[userId])
            } catch (error) {
              console.warn(`添加音频轨道(${streamType})到连接[${userId}]失败:`, error)
            }
          }
        })
      } else {
        // 如果连接不存在，则创建新的Offer
        this.createOffer(userId)
      }
    }

    console.log(`音频流(${streamType})已注册到组合流`)
    console.log(this.combinedStream)
  }

  // 复用注册麦克风流方法以注册系统音频流
  registerSystemAudioStream(audioStream: MediaStream) {
    this.registerAudioStream(audioStream, 'system_audio')
  }

  // 按类型和标识移除特定轨道
  removeTrackByTypeAndId(
    streamType: 'camera' | 'screen' | 'microphone' | 'system_audio',
    trackId?: string
  ) {
    let tracksToRemove: MediaStreamTrack[] = []

    if (streamType === 'camera' || streamType === 'screen') {
      tracksToRemove = this.combinedStream.getVideoTracks().filter((track) => {
        const trackStreamType = (track as any).streamType || 'camera'
        if (trackId) {
          return trackStreamType === streamType && track.id === trackId
        }
        return trackStreamType === streamType
      })
    } else {
      tracksToRemove = this.combinedStream.getAudioTracks().filter((track) => {
        const trackStreamType = (track as any).streamType || 'microphone'
        if (trackId) {
          return trackStreamType === streamType && track.id === trackId
        }
        return trackStreamType === streamType
      })
    }

    tracksToRemove.forEach((track) => {
      this.combinedStream.removeTrack(track)

      // 从所有连接中移除轨道
      Object.values(this.peerConnections).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track === track)
        if (sender) {
          pc.removeTrack(sender)
          // 触发重新协商以通知对等方
          this.triggerRenegotiation(pc)
        }
      })
    })
    console.log(`已移除${streamType}类型的轨道`)
  }

  // 获取特定类型轨道
  getTracksByType(streamType: 'camera' | 'screen' | 'microphone' | 'system_audio') {
    if (streamType === 'camera' || streamType === 'screen') {
      return this.combinedStream.getVideoTracks().filter((track) => {
        const trackStreamType = (track as any).streamType || 'camera'
        return trackStreamType === streamType
      })
    } else {
      return this.combinedStream.getAudioTracks().filter((track) => {
        const trackStreamType = (track as any).streamType || 'microphone'
        return trackStreamType === streamType
      })
    }
  }

  // 获取当前组合流状态
  getCombinedStreamInfo() {
    if (!this.combinedStream) {
      return {
        videoTracks: 0,
        audioTracks: 0,
        totalTracks: 0
      }
    }
    return {
      videoTracks: this.combinedStream.getVideoTracks().length,
      audioTracks: this.combinedStream.getAudioTracks().length,
      totalTracks: this.combinedStream.getTracks().length
    }
  }

  // 借助WebSocket服务发送信令
  private sendSignalMessage(method: MessageMethod, data: any) {
    // 直接发送 WebRTC 信令消息
    // this.socket.sendWebRtcMessage(message)
    this.socket.sendMessage(MessageType.WebRTC_Message, method, data)
  }

  // 为目标用户创建对应的 WebRTC 连接实例
  // 先创建WebRTC连接实例再根据实例创建Offer信令
  async createPeerConnection(userId: string) {
    console.log(`为目标用户(${userId})创建WebRTC连接实例`)
    const configuration = {
      // 配置 STUN 服务器列表用于 NAT 穿透
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun.stunprotocol.org:3478' },
        { urls: 'stun:stun.cloudflare.com:3478' }
      ],
      // 设置 ICE 候选池大小和传输策略
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all' as RTCIceTransportPolicy
    }
    // console.log('RTC配置:', configuration)
    // 创建 RTCPeerConnection 实例
    const peerConnection = new RTCPeerConnection(configuration)
    // console.log('创建RTCPeerConnection完成:', userId)

    console.log('本地流:', this.combinedStream)
    if (this.combinedStream && this.combinedStream.getTracks().length > 0) {
      this.combinedStream.getTracks().forEach((track) => {
        console.log(`添加本地轨道[${userId}]:`, track.kind, track.id)
        try {
          peerConnection.addTrack(track, this.combinedStream)
        } catch (error) {
          console.error(`添加本地轨道失败[${userId}]:`, error)
        }
      })
    } else {
      console.warn(`没有本地轨道可添加[${userId}]`)
    }

    // 监听远程流
    peerConnection.ontrack = (event) => {
      console.log(`收到远程轨道[${userId}]:`, event.track.kind, event.track.id)
      // 处理流中的所有轨道
      event.streams.forEach((stream) => {
        this.onRemoteStream(stream, userId)
      })
    }

    // 注册 ICE 候选处理,系统自动调用WebRTC_Ice_Candidate_Method
    peerConnection.onicecandidate = (event) => {
      console.log(`ICE候选事件[${userId}]:`, event)
      if (event.candidate) {
        console.log('发送ICE候选:', event.candidate)
        this.sendSignalMessage(MessageMethod.WebRTC_Ice_Candidate_Method, {
          receiverId: userId,
          candidate: event.candidate
        })
      } else {
        console.log('ICE候选收集完成', userId)
        this.sendSignalMessage(MessageMethod.WebRTC_Ice_Candidate_Method, {
          receiverId: userId,
          candidate: null
        })
      }
    }

    // 配置WebRTC连接状态变化监听
    peerConnection.onconnectionstatechange = () => {
      console.log(`连接状态变化[${userId}]:`, peerConnection.connectionState)
      switch (peerConnection.connectionState) {
        case 'connected':
          console.log(`WebRTC连接已建立[${userId}]`)
          break
        case 'disconnected':
          console.warn(`WebRTC连接断开[${userId}]`)
          break
        case 'failed':
          console.error(`WebRTC连接失败[${userId}]`)
          break
        case 'closed':
          console.log(`WebRTC连接已关闭[${userId}]`)
          break
      }
    }

    //  ICE连接状态变化监听
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE连接状态变化[${userId}]:`, peerConnection.iceConnectionState)
      if (peerConnection.iceConnectionState === 'failed') {
        console.error(`ICE连接失败[${userId}]`)
        // 可以尝试重新连接或提示用户
      }
    }

    // ICE错误监听
    peerConnection.onicecandidateerror = (event) => {
      console.error(`ICE候选收集错误[${userId}]:`, event.errorCode, event.errorText, event.url)
    }

    // peerConnection.onsignalingstatechange = () => {
    //   console.log(`信令状态变化[${userId}]:`, peerConnection.signalingState)
    // }

    // 添加ICE收集状态监听
    // peerConnection.onicegatheringstatechange = () => {
    //   console.log(`ICE收集状态[${userId}]:`, peerConnection.iceGatheringState)
    //   if (peerConnection.iceGatheringState === 'complete') {
    //     console.log(`ICE候选收集完成[${userId}]`)
    //   }
    // }

    // 存储WebRTC连接实例用于全局管理
    console.log(`成功为目标用户(${userId})创建WebRTC连接实例`)
    this.peerConnections[userId] = peerConnection
    return peerConnection
  }

  // 根据客户端为目标用户建立的WebRTC连接实例创建 Offer 信令
  async createOffer(receiverId: string) {
    console.log('接收到Ws的推送:新成员加入:', receiverId)
    console.log('创建Offer信令:', receiverId)

    console.log('createOffer获取组合流')
    console.log(this.combinedStream)

    // 如果发送Offer信令前未声明连接对象，则创建新的 RTCPeerConnection
    if (!this.peerConnections[receiverId]) {
      await this.createPeerConnection(receiverId)
    }

    // 获取与目标用户的WebRTC连接
    const peerConnection = this.peerConnections[receiverId]
    if (!peerConnection) {
      console.error('未为目标用户创建WebRTC连接实例:', receiverId)
      return
    }

    try {
      // 创建 Offer 信令
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      console.log('发送Offer信令:', offer)
      // 发送Offer信令至WS服务端
      this.sendSignalMessage(MessageMethod.WebRTC_Offer_Method, {
        receiverId: receiverId,
        // WebRTC 标准参数
        offer: peerConnection.localDescription
      })
    } catch (error) {
      console.error('为目标用户创建WebRTC连接实例对应的 Offer 失败:', error)
    }
  }

  // 注册处理函数到ws
  private initSocketListeners() {
    // this.socket.registerHandlers(MessageMethod.WebRTC_Create_Method, (data) => {
    //   this.createOffer(data.receiverId)
    // })

    this.socket.registerHandlers(MessageMethod.WebRTC_Offer_Method, (data) => {
      this.handleOffer(data)
    })

    this.socket.registerHandlers(MessageMethod.WebRTC_Answer_Method, (data) => {
      this.handleAnswer(data)
    })

    this.socket.registerHandlers(MessageMethod.WebRTC_Ice_Candidate_Method, (data) => {
      this.handleIceCandidate(data)
    })

    this.socket.registerHandlers(MessageMethod.WebRTC_User_Joined_Method, (data) => {
      this.createPeerConnection(data.senderId)
    })

    this.socket.registerHandlers(MessageMethod.WebRTC_User_Left_Method, (data) => {
      this.closePeerConnection(data.senderId)
    })
  }

  // 响应 Offer 消息
  private async handleOffer(data: any) {
    try {
      console.log('接收到 Offer 信令:', data)
      let peerConnection

      // 检查是否已存在连接（重新协商情况）
      if (this.peerConnections[data.senderId]) {
        peerConnection = this.peerConnections[data.senderId]
        console.log('处理重新协商的 Offer')
      } else {
        // 创建新的连接
        peerConnection = await this.createPeerConnection(data.senderId)
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))

      // 根据连接实例创建 Answer 信令
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      console.log('发送Answer信令:', answer)
      // 响应 Answer 信令至WS服务端
      this.sendSignalMessage(MessageMethod.WebRTC_Answer_Method, {
        receiverId: data.senderId,
        // WebRTC 标准参数
        answer: peerConnection.localDescription
      })
    } catch (error) {
      console.error('处理 Offer 失败:', error)
    }
  }

  // 处理 Answer 消息
  private async handleAnswer(data: any) {
    try {
      console.log('收到 Answer 信令:', data)
      // 获取之前为目标用户建立的WebRTC连接实例
      const peerConnection = this.peerConnections[data.senderId]
      if (peerConnection) {
        // 设置 Answer 信令
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
        console.log('成功设置远程Answer描述:', data.senderId)
      }
    } catch (error) {
      console.error('处理 Answer 失败:', error)
    }
  }

  // 处理 ICE Candidate 消息
  private async handleIceCandidate(data: any) {
    try {
      console.log('收到 ICE Candidate 信令:', data)
      const peerConnection = this.peerConnections[data.senderId]
      if (peerConnection) {
        // 处理 ICE 收集完成的情况
        if (data.candidate === null) {
          console.log('ICE候选收集完成:', data.senderId)
          return
        }

        // 验证候选数据
        if (
          !data.candidate ||
          (!data.candidate.candidate &&
            !data.candidate.sdpMid &&
            data.candidate.sdpMLineIndex === undefined)
        ) {
          console.warn('无效的 ICE Candidate 数据')
          return
        }

        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
        console.log('成功添加ICE候选:', data.senderId)
      }
    } catch (error) {
      console.error('处理 ICE Candidate 失败:', error)
    }
  }

  // 关闭 客户端之间的WebRTC 连接
  closePeerConnection(userId: string) {
    if (this.peerConnections[userId]) {
      this.peerConnections[userId].close()
      delete this.peerConnections[userId]
    }
  }

  // 远程流处理
  onRemoteStream(stream: MediaStream, userId: string) {
    console.log('监听远程媒体流:', userId)
    const remoteVideoContainer = document.getElementById('remote-videos')
    if (!remoteVideoContainer) {
      console.warn('找不到 remote-videos 容器')
      return
    }
    const remoteAudioContainer = document.getElementById('remote-audios')
    if (!remoteAudioContainer) {
      console.warn('找不到 remote-audios 容器')
      return
    }

    // 监听流中轨道被移除的事件
    stream.onremovetrack = (event) => {
      const removedTrack = event.track
      console.log(`远程轨道被移除[${userId}]:`, removedTrack.kind, removedTrack.id)
      console.log('删除对应的显示元素')
      // 删除对应的显示元素
      const elementId = `remote-${removedTrack.kind}-${userId}-${removedTrack.id}`
      const element = document.getElementById(elementId)
      if (element) {
        element.remove()
        console.log(`已删除远程${removedTrack.kind}元素:`, elementId)
      } else {
        // 尝试查找不带trackId的元素（兼容旧版本）
        const simpleElementId = `remote-${removedTrack.kind}-${userId}`
        const simpleElement = document.getElementById(simpleElementId)
        if (simpleElement) {
          simpleElement.remove()
          console.log(`已删除远程${removedTrack.kind}元素:`, simpleElementId)
        }
      }
    }

    // 为流中的每个轨道创建独立的显示元素
    stream.getTracks().forEach((track) => {
      const trackId = track.id
      let elementId = `remote-${track.kind}-${userId}`

      // 如果有多个同类型轨道，需要区分显示
      if (stream.getTracks().filter((t) => t.kind === track.kind).length > 1) {
        elementId += `-${trackId}`
      }

      let mediaElement: HTMLVideoElement | HTMLAudioElement | null = null
      const element = document.getElementById(elementId)

      if (element instanceof HTMLVideoElement || element instanceof HTMLAudioElement) {
        mediaElement = element
      }

      if (track.kind === 'video') {
        if (!(mediaElement instanceof HTMLVideoElement)) {
          // 移除旧元素（如果存在且类型不匹配）
          if (mediaElement) mediaElement.remove()
          mediaElement = document.createElement('video')
          mediaElement.id = elementId
          mediaElement.autoplay = true
          mediaElement.muted = false
          remoteVideoContainer.appendChild(mediaElement)
        } else {
          mediaElement.playsInline = true // 确保已设置
        }
      } else if (track.kind === 'audio') {
        console.log('监听远程音频流1:', userId)
        if (!(mediaElement instanceof HTMLAudioElement)) {
          // 移除旧元素（如果存在且类型不匹配）
          if (element) {
            element.remove()
          }
          mediaElement = document.createElement('audio')
          mediaElement.id = elementId
          mediaElement.autoplay = true

          // 添加样式使音频元素不占据布局空间
          mediaElement.style.position = 'absolute'
          mediaElement.style.width = '0'
          mediaElement.style.height = '0'
          mediaElement.style.opacity = '0'
          mediaElement.style.pointerEvents = 'none'

          remoteAudioContainer.appendChild(mediaElement)
        }
      }

      // 确保 mediaElement 已定义
      if (mediaElement) {
        const trackStream = new MediaStream([track])
        mediaElement.srcObject = trackStream

        // 添加播放事件监听
        mediaElement.onloadedmetadata = () => {
          console.log(`远程${track.kind}[${userId}]元数据加载完成`)
        }
        mediaElement.onplay = () => {
          console.log(`远程${track.kind}[${userId}]开始播放`)
        }
      } else {
        console.warn(`无法为轨道 [${trackId}] 创建媒体元素`)
      }
    })
  }

  // joinRoom(roomId: string) {
  //   this.sendSignalMessage(MessageMethod.WebRTC_User_Joined_Method, {
  //     type: 'join-room',
  //     roomId: roomId
  //   })
  // }

  leaveRoom() {
    // this.sendSignalMessage(MessageMethod.WebRTC_User_Left_Method, {
    //   type: 'leave-room',
    //   roomId: roomId
    // })
    Object.keys(this.peerConnections).forEach((userId) => {
      this.closePeerConnection(userId)
    })
  }
}

// 转由主进程处理
export const webRTCMediaService = new WebRTCMediaService()
