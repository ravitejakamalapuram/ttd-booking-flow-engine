export interface StorageLike{get<T>(key:string):Promise<T|undefined>;set<T>(key:string,value:T):Promise<void>;}
export interface ChromeStorageAreaLike{get(keys:string):Promise<Record<string,unknown>>;set(items:Record<string,unknown>):Promise<void>;}
export class ChromeStorage implements StorageLike{constructor(private readonly area:ChromeStorageAreaLike){}async get<T>(key:string){return(await this.area.get(key))[key] as T|undefined}async set<T>(key:string,value:T){await this.area.set({[key]:value})}}
