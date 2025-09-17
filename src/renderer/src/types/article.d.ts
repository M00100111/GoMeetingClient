interface UserInterface{
  id: number;
  username: string;
  email: string;
  avatar: string;
  introduction: string;
  followers: number;
  articles:number,
}
//文章接口
export interface ArticleInterface{
  id: number;
  created_date: string;
  created_time: string;
  user_info: UserInterface;
  category: string;
  tags: string[];
  title: string;
  subTitle: string;
  image:string;
  content: string;
  likes: number;
  views: number;
  comments: number;
}

export interface CategoryInterface{
  ID: number;
  category_name: string;
}

export interface ArticleFormInterface{
  title: string;
  subTitle: string;
  image:string;
  content: string;
  category: number;
  tags: string[];
  status: number;
}