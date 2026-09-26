import { create } from 'zustand';
import { api } from '../api/client';
import type { UserMeProfile, UserPublicProfile, FortuneHistoryItem } from '../api/types';
interface ProfileState{me:UserMeProfile|null;other:UserPublicProfile|null;history:FortuneHistoryItem[];loading:boolean;loadMe:()=>Promise<void>;loadUser:(u:string)=>Promise<void>;loadHistory:(u:string)=>Promise<void>;}
export const useProfile=create<ProfileState>((set)=>({
  me:null,other:null,history:[],loading:false,
  async loadMe(){set({loading:true});try{const r=await api.getMyProfile();set({me:r.user});}finally{set({loading:false});}},
  async loadUser(u){set({loading:true,other:null,history:[]});try{const[o,h]=await Promise.all([api.getUserProfile(u),api.getFortuneHistory(u)]);set({other:o,history:h});}finally{set({loading:false});}},
  async loadHistory(u){const h=await api.getFortuneHistory(u);set({history:h});}
}));
