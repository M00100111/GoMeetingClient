// 消息类型枚举
export enum MessageType {
  Ping_Message = 0,
  Pong_Message = 1,
  Notification_Message = 2,
  Chat_Message = 3,
  Error_Message = 4
}

// 消息方法枚举
export enum MessageMethod {
  Ping_Method = 'Ping',
  Pong_Method = 'Pong',
  Chat_Method = 'Chat',
  Notification_Method = 'Notification',
  Meeting_Start_Notice_Method = 'Meeting_Start_Notification',
  Meeting_End_Notice_Method = 'Meeting_End_Notification',
  Meeting_Member_Join_Notice_Method = 'Meeting_Member_Join',
  Meeting_Member_Leave_Notice_Method = 'Meeting_Member_Leave',
  Meeting_Message_Method = 'Meeting_Message'
}
export function strToMessageMethod(str: string): MessageMethod | null {
  // 遍历枚举所有值，检查是否匹配
  const values = Object.values(MessageMethod)
  if (values.includes(str as MessageMethod)) {
    return str as MessageMethod
  }
  return null
}

// 基础消息接口
export interface Message {
  message_type: MessageType
  // 服务端新增方法时，旧版客户端不会因为未知枚举值而出错
  method: MessageMethod | string
  // 本质是字符串
  // '{"sender_id":"user123","chat_type":0,"receiver_id":"user456","msg_type":0,"msg":"Hello World","send_time":1634567890}'
  data: any
}

// 具体消息类型定义
export interface PingData {
  sender_id: string
  msg: string
}

export interface ChatData {
  sender_id: string
  chat_type: ChatType
  receiver_id: string
  msg_type: MsgType
  msg: string
  send_time: number
}

export interface NotificationData {
  receiver_id: string
  msg: string
}

// 聊天和消息类型枚举
export enum ChatType {
  SingleChat = 0,
  GroupChat = 1
}

export enum MsgType {
  Text_Msg = 0,
  Image_Msg = 1,
  Video_Msg = 2,
  File_Msg = 3
}

// 泛型消息接口，用于类型安全的数据处理
export interface TypedMessage<T> extends Message {
  data: T
}

export type MessageHandler = (data: any) => void
