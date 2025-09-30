import { defineStore } from 'pinia'
import api from '@/api/api'
// 在 room.ts store 中定义成员数据结构
interface RoomMember {
  username: string
  email: string
  sex: number
  userType: number
  userStatus: number

  audioEnabled: boolean
  videoEnabled: boolean
  screenSharing: boolean
}

export const useRoomStore = defineStore('Room', {
  //存储数据
  state() {
    return {
      // 会议信息
      roomInfo: {
        meetingId: 0, // 会议id
        meetingName: '未知会议', //会议名称
        joinType: 0, //会议类型
        startTime: '' //会议开始时间
      },

      // 使用 Map 存储，键为 userId，值为成员信息
      roomMembers: new Map<number, RoomMember>()
    }
  },
  actions: {
    async getRoomInfo() {
      //根据token获取用户所在会议基本信息
      try {
        const response = await api.getMeetingInfo()
        //更新用户基本数据
        if ((response as any).code === 200) {
          console.log('获取用户基本信息成功')
          console.log(response.data)
          this.roomInfo = {
            meetingId: response.data.meetingId,
            meetingName: response.data.meetingName,
            joinType: response.data.joinType,
            startTime: response.data.startTime
          }
          return Promise.resolve(response.data)
        } else {
          return Promise.reject(response)
        }
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async getRoomMembersInfo() {
      try {
        const response = await api.getMeetingMembersInfo()
        if ((response as any).code === 200) {
          console.log('获取会议成员信息成功')
          console.log(response.data)
        }
      } catch (error) {
        return Promise.reject(error)
      }
    },
    leaveRoom() {
      this.$reset()
    }
  }
})
