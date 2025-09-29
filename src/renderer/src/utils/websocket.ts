import {
  Message,
  MessageHandler,
  MessageType,
  MessageMethod,
  PingData,
  strToMessageMethod
} from '@/types/message'
import { useUserInfoStore } from '@/store'
class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectTimer: any = null
  private messageHandlers = new Map<MessageMethod, MessageHandler>()
  private url: string = ''
  private isConnected: boolean = false

  // 连接WebSocket
  connect(serverUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.url = serverUrl

      try {
        this.ws = new WebSocket(serverUrl)
        // 设置事件回调函数
        // 建立ws连接后的触发事件
        this.ws.onopen = () => {
          console.log('WebSocket连接成功')
          this.isConnected = true
          this.startPing()
          resolve(true)
        }
        // 接收到ws消息时的触发事件
        this.ws.onmessage = (event) => {
          console.log('接收到消息', event)
          this.readMessage(event)
        }
        // 关闭ws连接时的触发事件
        this.ws.onclose = () => {
          console.log('WebSocket连接关闭')
          this.isConnected = false
          // this.handleReconnect()
        }
        // 出现ws错误时的触发事件
        this.ws.onerror = (error) => {
          console.error('WebSocket错误:', error)
          this.isConnected = false
          resolve(false)
        }
      } catch (error) {
        console.error('创建WebSocket失败:', error)
        resolve(false)
      }
    })
  }

  // 全局路由注册
  registerHandlers(method: MessageMethod, handler: MessageHandler) {
    this.messageHandlers.set(method, handler)
  }

  // 关闭连接,登出时应关闭连接
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.isConnected = false
  }

  // 获取连接状态
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  // 发送消息
  sendMessage(message_type: MessageType, method: MessageMethod, data: any): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket未连接')
      return false
    }

    const message: Message = {
      message_type,
      method,
      data
    }

    this.ws.send(JSON.stringify(message))
    return true
  }

  sendPingMessage(msg: string = 'ping'): boolean {
    const userInfoStore = useUserInfoStore()
    const sender_id = userInfoStore.userId

    if (!sender_id) {
      console.log('获取不到userInfoStore.userId')
      return false
    }
    const data: PingData = {
      sender_id,
      msg
    }
    return this.sendMessage(
      MessageType.Ping_Message, // message_type
      MessageMethod.Ping_Method, // method
      data
    )
  }

  sendPongMessage(msg: string = 'pong'): boolean {
    const userInfoStore = useUserInfoStore()
    const sender_id = userInfoStore.userId
    if (!sender_id) {
      console.log('获取不到userInfoStore.userId')
      return false
    }
    const data: PingData = {
      sender_id,
      msg
    }
    return this.sendMessage(
      MessageType.Pong_Message, // message_type
      MessageMethod.Pong_Method, // method
      data
    )
  }

  // 私有方法：处理消息
  private readMessage(event: MessageEvent) {
    try {
      const message: Message = JSON.parse(event.data)

      // 处理服务器发来的ping消息
      if (message.message_type === MessageType.Ping_Message) {
        const pingData = message.data as PingData
        this.sendPongMessage(pingData.msg)
        return
      }
      // 处理pong
      if (message.message_type === MessageType.Pong_Message) {
        const pongData = message.data as PingData
        // 收到pong响应，连接正常
        console.log('服务端的Ping响应:', pongData.msg)
        return
      }

      // 调用对应的消息处理器
      // ✅ 1. 将字符串 method 转为枚举值
      const method = strToMessageMethod(message.method)
      if (!method) {
        console.warn('未知的消息方法:', message.method)
        return // 忽略非法消息
      }
      const handler = this.messageHandlers.get(method)
      if (handler) {
        handler(message.data)
      }
    } catch (error) {
      console.error('解析消息失败:', error)
    }
  }

  // 私有方法：断线重连
  private handleReconnect() {
    if (this.reconnectTimer) return

    this.reconnectTimer = setTimeout(() => {
      console.log('尝试重新连接...')
      this.connect(this.url)
    }, 3000)
  }

  // 私有方法：开始ping
  private startPing() {
    // 每30秒发送一次ping
    setInterval(() => {
      if (this.isConnected) {
        this.sendPingMessage()
      }
    }, 30000)
  }
}

// 创建单例
export const websocketService = new WebSocketService()
