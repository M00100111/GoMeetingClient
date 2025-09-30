import { baseRequest, userRequest, toolRequest, meetingRequest } from '@/api/http'
import type { ArticleFormInterface } from '@/types/article.d.ts'
import { endianness } from 'os'
// 当请求为post时，若需携带token但无数据可req需要{ }占位，否则配置项错误无法携带token
export default {
  // 工具相关api
  getCaptcha: (data = {}) => toolRequest.post('/captcha', data),
  //用户相关api
  signUp: (data = {}) => userRequest.post('/signup', data),
  login: (data = {}) => userRequest.post('/login', data),
  logout: () => userRequest.get('/logout'),

  // 会议相关api
  startMeeting: (data = {}) => meetingRequest.post('/startmeeting', data, { needToken: true }),
  getMeetingInfo: () => meetingRequest.get('/getmeetinginfo', { needToken: true }),
  endMeeting: (data = {}) => meetingRequest.post('/endmeeting', data, { needToken: true }),
  leaveMeeting: (data = {}) => meetingRequest.post('/leavemeeting', data, { needToken: true }),
  getMeetingMembers: () => meetingRequest.post('/getmeetingmembers', {}, { needToken: true }),
  getMeetingMembersInfo: () =>
    meetingRequest.post('/getmeetingmembersinfo', {}, { needToken: true }),

  //分页获取文章列表
  getArticleList: (params = {}) => baseRequest.get('/article/list', { params }),
  //分页获取分享列表
  getShareList: (params = {}) => baseRequest.get('/share/list', { params }),
  // 根据文章id获取文章
  getArticleById: (id: number) => baseRequest.get(`article/${id}`),
  // 根据文章id获取文章评论
  getCommentList: (id: number) => baseRequest.get(`/article/${id}/comment`),
  //使用multipart/form-data上传图片
  uploadImage: (formData: any) =>
    baseRequest.post('publish/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  //获取文章分类列表
  getCategoryList: () => baseRequest.get('/publish/category'),

  // 需要token的接口
  getUserInfo: () => baseRequest.get('/user/info', { needToken: true }),
  // 发布评论
  submitComment: (formData: any) =>
    baseRequest.post(`/article/${formData.articleId}/comment`, formData, {
      needToken: true
    }),
  // 发布文章
  pulishArticle: (data: ArticleFormInterface) =>
    baseRequest.post('/publish/article', data, { needToken: true })
}
