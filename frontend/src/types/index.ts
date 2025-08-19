export enum ComponentType {
  BIO = 'BIO',
  TEXT = 'TEXT'
}

export enum PostType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE'
}

export enum BackgroundType {
  COLOR = 'COLOR',
  IMAGE = 'IMAGE'
}

export interface UserProfile {
  uuid: string;
  username: string;
  displayName: string;
  bio: string;
  followingCount: number;
  followerCount: number;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageInfo {
  createdAt: string;
  updatedAt: string;
  sectionCount: number;
  backgroundType: BackgroundType;
  backgroundColor: string;
  backgroundImage?: string;
  font: string;
}

export interface BaseComponent {
  createdAt: string;
  updatedAt: string;
  order: number;
  uuid: string;
  componentType: ComponentType;
}

export interface BioComponent extends BaseComponent {
  componentType: ComponentType.BIO;
  username: string;
  displayName: string;
  bio: string;
  followingCount: number;
  followerCount: number;
  postCount: number;
}

export interface TextComponent extends BaseComponent {
  componentType: ComponentType.TEXT;
  font: string;
  backgroundColor: string;
  text: string;
}

// export interface LinkComponent extends BaseComponent {
//   componentType: ComponentType.LINK;
//   url: string;
//   title: string;
// }

// export interface ImageComponent extends BaseComponent {
//   componentType: ComponentType.IMAGE;
//   imageUrl: string;
//   altText: string;
// }

export type AnyComponent = BioComponent | TextComponent;

export interface PageResponse {
  page: PageInfo;
  components: AnyComponent[];
  componentCount: number;
  totalSections: number;
}

export interface Post {
  createdAt: string;
  updatedAt: string;
  username: string;
  displayName: string;
  uuid: string;
  postType: PostType;
}

export interface TextPost extends Post {
  postType: PostType.TEXT;
  text: string;
}

export type AnyPost = Post | TextPost;