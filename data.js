import {collection,addDoc,doc,getDoc,setDoc,updateDoc,deleteDoc,onSnapshot,query,orderBy,serverTimestamp,arrayUnion,arrayRemove,increment,limit,where} from 'firebase/firestore';
import {db,storage} from '../firebase';
import {ref,uploadBytes,getDownloadURL} from 'firebase/storage';

export const userRef=uid=>doc(db,'users',uid);
export async function getUser(uid){const s=await getDoc(userRef(uid));return s.exists()?s.data():null;}
export async function ensureUser(u){const r=userRef(u.uid),s=await getDoc(r),developer=u.email?.toLowerCase()==='mustafamirac000@gmail.com';const base={uid:u.uid,email:u.email||'',displayName:developer?'Mavi':(u.displayName||'Kullanıcı'),photoURL:u.photoURL||'',role:developer?'DEVELOPER':'USER',xp:0,level:1,clanId:null,bio:'',socials:{},stats:{successfulMutes:0,successfulActions:0,complaints:0,joinedAt:Date.now()},createdAt:serverTimestamp(),updatedAt:serverTimestamp()};if(!s.exists())await setDoc(r,base);else if(developer)await updateDoc(r,{displayName:'Mavi',role:'DEVELOPER',updatedAt:serverTimestamp()});return(await getDoc(r)).data();}
export async function uploadSmall(uid,file,folder){if(!file)return '';if(file.size>5*1024*1024)throw Error('Dosya 5 MB sınırını aşamaz.');if(!file.type.startsWith('image/'))throw Error('Sadece görsel yükleyebilirsin.');const id=crypto.randomUUID();const r=ref(storage,`users/${uid}/${folder}/${id}`);await uploadBytes(r,file,{contentType:file.type,cacheControl:'public,max-age=31536000'});return getDownloadURL(r);}
export const addStorage=(uid,name,url)=>addDoc(collection(db,'users',uid,'storageLinks'),{name,url,createdAt:serverTimestamp()});
export const watchStorage=(uid,cb)=>onSnapshot(query(collection(db,'users',uid,'storageLinks'),orderBy('createdAt','desc')),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))));
export const removeStorage=(uid,id)=>deleteDoc(doc(db,'users',uid,'storageLinks',id));
export const watchApps=cb=>onSnapshot(query(collection(db,'apps'),orderBy('createdAt','desc')),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))));
export const createPost=data=>addDoc(collection(db,'posts'),{...data,likes:[],likesCount:0,commentsCount:0,createdAt:serverTimestamp()});
export const watchPosts=(cb,sort='new')=>{const q=sort==='likes'?query(collection(db,'posts'),orderBy('likesCount','desc'),limit(100)):query(collection(db,'posts'),orderBy('createdAt','desc'),limit(100));return onSnapshot(q,s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))))};
export const toggleLike=(id,uid,liked)=>updateDoc(doc(db,'posts',id),{likes:liked?arrayRemove(uid):arrayUnion(uid),likesCount:increment(liked?-1:1)});
export const addReport=data=>addDoc(collection(db,'reports'),{...data,status:'open',createdAt:serverTimestamp()});
export const deletePost=id=>deleteDoc(doc(db,'posts',id));
export const watchNotifications=(uid,cb)=>onSnapshot(query(collection(db,'notifications'),where('uid','==',uid),orderBy('createdAt','desc'),limit(50)),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))));
export const addXp=(uid,xp,reason)=>addDoc(collection(db,'xpEvents'),{uid,xp,reason,createdAt:serverTimestamp()});
export const watchComments=(postId,cb)=>onSnapshot(query(collection(db,'posts',postId,'comments'),orderBy('createdAt','asc'),limit(100)),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))));
export const addComment=(postId,data)=>addDoc(collection(db,'posts',postId,'comments'),{...data,createdAt:serverTimestamp()});
export const deleteComment=(postId,id)=>deleteDoc(doc(db,'posts',postId,'comments',id));
export const updateProfile=(uid,data)=>updateDoc(userRef(uid),data);
export const watchClanMessages=(clanId,cb)=>onSnapshot(query(collection(db,'clans',clanId,'messages'),orderBy('createdAt','asc'),limit(200)),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))));
export const addClanMessage=(clanId,data)=>addDoc(collection(db,'clans',clanId,'messages'),{...data,createdAt:serverTimestamp()});
export const watchClanInvites=(uid,cb)=>onSnapshot(query(collection(db,'clanInvites'),where('toUid','==',uid),where('status','==','pending'),orderBy('createdAt','desc'),limit(50)),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))));
export const watchAllReports=cb=>onSnapshot(query(collection(db,'reports'),orderBy('createdAt','desc'),limit(100)),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))));
export const watchAnnouncements=cb=>onSnapshot(query(collection(db,'announcements'),orderBy('createdAt','desc'),limit(20)),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))));
