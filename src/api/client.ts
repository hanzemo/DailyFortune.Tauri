import type{AuthResponse,MyProfileResponse,UserPublicProfile,RegistrationStatusResponse,FortuneDrawResponse,FortuneHistoryItem,LeaderboardGroup,LeaderboardPeriod,UserUpdatePayload}from'./types';
const BASE='http://186.241.81.212:8000',AK='access_token',RK='refresh_token';
declare global{interface Window{__TAURI__?:{invoke:(c:string,a?:Record<string,unknown>)=>Promise<unknown>};}}
const inv=async<T=unknown>(c:string,a?:Record<string,unknown>):Promise<T|null>=>{const i=window.__TAURI__?.invoke;if(!i)return null;return await i(c,a)as T;};
const saveT=async(k:string,v:string)=>{if(await inv('save_auth_token',{key:k,value:v})===null)localStorage.setItem(k,v);};
const readT=async(k:string):Promise<string|null>=>{const v=await inv<string>('get_auth_token',{key:k});return v!==null?v:localStorage.getItem(k);};
const delT=async(k:string)=>{if(await inv('delete_auth_token',{key:k})===null)localStorage.removeItem(k);};
export class ApiError extends Error{statusCode:number;constructor(c:number,m:string){super(m);this.statusCode=c;}}
const exErr=(d:string,c:number)=>{try{const e=JSON.parse(d);if(e?.detail)return e.detail;}catch{}return `服务器错误: ${c}`;};
async function req<T>(ep:string,m:string,b?:unknown,auth=true):Promise<T>{const h:Record<string,string>={Accept:'application/json'};if(auth){const t=await readT(AK);if(t)h['Authorization']=`Bearer ${t}`;}const i:RequestInit={method:m,headers:h};if(b!==undefined){h['Content-Type']='application/json';i.body=JSON.stringify(b);}const r=await fetch(BASE+ep,i),t=await r.text();if(!r.ok)throw new ApiError(r.status,exErr(t,r.status));return t?JSON.parse(t)as T:(undefined as T);}
async function reqNC(ep:string,m:string,b?:unknown,auth=true):Promise<void>{const h:Record<string,string>={};if(auth){const t=await readT(AK);if(t)h['Authorization']=`Bearer ${t}`;}const i:RequestInit={method:m,headers:h};if(b!==undefined){h['Content-Type']='application/json';i.body=JSON.stringify(b);}const r=await fetch(BASE+ep,i);if(!r.ok){const t=await r.text();throw new ApiError(r.status,exErr(t,r.status));}}
export const api={
  getRegistrationStatus:()=>req<RegistrationStatusResponse>('/config/registration-status','GET',undefined,false),
  async login(u:string,p:string):Promise<AuthResponse>{const f=new URLSearchParams({username:u,password:p});const r=await fetch(BASE+'/auth/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:f.toString()});const t=await r.text();if(!r.ok)throw new ApiError(r.status,exErr(t,r.status));return JSON.parse(t)as AuthResponse;},
  register:(u:string,e:string,p:string)=>req<AuthResponse>('/auth/register','POST',{username:u,email:e,password:p},false),
  refresh:(rt:string)=>req<AuthResponse>('/auth/refresh','POST',{refresh_token:rt},false),
  getMyProfile:()=>req<MyProfileResponse>('/users/me','GET'),
  getUserProfile:(u:string)=>req<UserPublicProfile>(`/users/u/${encodeURIComponent(u)}`,'GET'),
  updateMyProfile:(p:UserUpdatePayload)=>req<MyProfileResponse>('/users/me','PATCH',p),
  changePassword:(c:string,n:string)=>reqNC('/users/me/password','PATCH',{current_password:c,new_password:n}),
  getFortuneHistory:(u:string)=>req<FortuneHistoryItem[]>(`/users/u/${encodeURIComponent(u)}/fortune-history`,'GET'),
  deleteMyAccount:()=>reqNC('/users/me','DELETE'),
  drawFortune:()=>req<FortuneDrawResponse>('/fortune/draw','POST'),
  getLeaderboard:(p:LeaderboardPeriod='today')=>req<LeaderboardGroup[]>(`/fortune/leaderboard?period=${p}`,'GET'),
  adminGetAllUsers:()=>req<unknown[]>('/admin/users','GET'),
  adminUpdateUser:(id:string,p:UserUpdatePayload)=>reqNC(`/admin/users/${id}`,'PATCH',p),
  adminUpdateRole:(id:string,r:string)=>reqNC(`/admin/users/${id}/role`,'POST',{role:r}),
  adminDeleteUser:(id:string)=>reqNC(`/admin/users/${id}`,'DELETE'),
  adminResetPassword:(id:string,n:string)=>reqNC(`/admin/users/${id}/reset-password`,'POST',{new_password:n}),
  adminUpdateStatus:(id:string,s:string)=>reqNC(`/admin/users/${id}/status`,'POST',{status:s}),
  adminUpdateVisibility:(id:string,h:boolean)=>reqNC(`/admin/users/${id}/visibility`,'POST',{is_hidden:h}),
  adminUpdateTags:(id:string,t:string[])=>reqNC(`/admin/users/${id}/tags`,'POST',{tags:t}),
};
export const tokenStore={saveAccess:(t:string)=>saveT(AK,t),saveRefresh:(t:string)=>saveT(RK,t),getAccess:()=>readT(AK),getRefresh:()=>readT(RK),async clearAll(){await delT(AK);await delT(RK);}};
