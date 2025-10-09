// webrtc.ts
import { websocketService } from './websocket'
import { MessageType, MessageMethod } from '@/types/message'

// 定义WebRtc服务类
class WebRTCMediaService {
  // WebSocket 连接实例，用于信令传输
  private socket: typeof websocketService
  // 存储所有对等连接的映射表，以用户ID为键
  private peerConnections: { [key: string]: RTCPeerConnection }
  // 本地媒体流（音视频）
  private localStream: MediaStream | null

  // 构造器
  constructor() {
    this.socket = websocketService
    this.peerConnections = {}
    this.localStream = null

    this.initSocketListeners()
  }

  // 获取默认的本地媒体流（同时包含音视频）
  async init() {
    // 获取本地媒体流
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })

    // 显示本地视频
    const localVideo = document.getElementById('local-video') as HTMLVideoElement | null
    if (localVideo) {
      localVideo.srcObject = this.localStream
    }
  }

  // 设置外部获取的流
  setLocalStream(stream: MediaStream) {
    this.localStream = stream

    // 显示本地视频
    const localVideo = document.getElementById('local-video') as HTMLVideoElement | null
    if (localVideo) {
      localVideo.srcObject = stream
    }

    // 将流添加到所有已存在的连接中
    Object.values(this.peerConnections).forEach((pc) => {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream)
      })
    })
  }

  // 更新流（用于动态添加/删除轨道）
  updateLocalStream(newStream: MediaStream) {
    if (this.localStream) {
      // 停止旧流的所有轨道
      this.localStream.getTracks().forEach((track) => track.stop())
    }

    this.localStream = newStream

    // 更新本地显示
    const localVideo = document.getElementById('local-video') as HTMLVideoElement | null
    if (localVideo) {
      localVideo.srcObject = newStream
    }

    // 更新所有现有连接
    Object.entries(this.peerConnections).forEach(([userId, pc]) => {
      // 移除旧发送者
      pc.getSenders().forEach((sender) => {
        pc.removeTrack(sender)
      })

      // 添加新轨道
      if (newStream) {
        newStream.getTracks().forEach((track) => {
          pc.addTrack(track, newStream)
        })
      }
    })
  }
  // 注册处理函数到ws
  private initSocketListeners() {
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
  // 借助WebSocket服务发送信令
  private sendSignalMessage(method: MessageMethod, data: any) {
    // 直接发送 WebRTC 信令消息
    // this.socket.sendWebRtcMessage(message)
    this.socket.sendMessage(MessageType.WebRTC_Message, method, data)
  }

  // 客户端之间建立WebRTC 连接
  async createPeerConnection(userId: string) {
    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    }

    const peerConnection = new RTCPeerConnection(configuration)

    // 添加本地流
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!)
      })
    }

    // 监听远程流
    peerConnection.ontrack = (event) => {
      this.onRemoteStream(event.streams[0], userId)
    }

    // ICE候选处理
    // 建立WebRTC连接
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalMessage(MessageMethod.WebRTC_Ice_Candidate_Method, {
          receiverId: userId,
          // WebRTC 标准参数
          candidate: event.candidate
        })
      }
    }

    this.peerConnections[userId] = peerConnection
    return peerConnection
  }

  // Offer->Answer->ICECandidate->PeerConnection->RemoteStream
  // 客户端之间交换 Offer 消息
  async createOffer(userId: string) {
    const peerConnection = this.peerConnections[userId]
    if (!peerConnection) {
      console.error('PeerConnection 不存在:', userId)
      return
    }

    try {
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      this.sendSignalMessage(MessageMethod.WebRTC_Offer_Method, {
        receiverId: userId,
        // WebRTC 标准参数
        offer: peerConnection.localDescription
      })
    } catch (error) {
      console.error('创建 Offer 失败:', error)
    }
  }

  // 处理 Offer 消息
  private async handleOffer(data: any) {
    try {
      const peerConnection = await this.createPeerConnection(data.sender)
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      this.sendSignalMessage(MessageMethod.WebRTC_Answer_Method, {
        receiverId: data.sender,
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
      const peerConnection = this.peerConnections[data.sender]
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
      }
    } catch (error) {
      console.error('处理 Answer 失败:', error)
    }
  }
  // 处理 ICE Candidate 消息
  private async handleIceCandidate(data: any) {
    try {
      const peerConnection = this.peerConnections[data.sender]
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
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

  onRemoteStream(stream: MediaStream, userId: string) {
    const remoteVideoContainer = document.getElementById('remote-videos')
    if (!remoteVideoContainer) {
      console.warn('找不到 remote-videos 容器')
      return
    }

    let videoElement = document.getElementById(`remote-video-${userId}`) as HTMLVideoElement
    if (!videoElement) {
      videoElement = document.createElement('video')
      videoElement.id = `remote-video-${userId}`
      videoElement.autoplay = true
      videoElement.playsInline = true
      remoteVideoContainer.appendChild(videoElement)
    }

    videoElement.srcObject = stream
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

export const webRTCMediaService = new WebRTCMediaService()
