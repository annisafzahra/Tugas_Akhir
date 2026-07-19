import { registerType } from "@/type/registerType"
import { BASEURL, getUser, login, register } from "./api"
import { loginType } from "@/type/loginType";
import { setToken } from "./token";
import { userGetType } from "@/type/userGetType";
import { useEffect, useState } from "react";

export const CreateUser = async (data: registerType) => {
  try {
    const res = await register(data);

    if (res.status === 201) {
      return {
        success: true,
        data: res.data,
      };
    }

    return {
      success: false,
      message: 'Register gagal.',
    };
  } catch (e: any) {
    console.log('ERROR REGISTER:', e.response?.data || e);

    if (e.response?.status === 400) {
      return {
        success: false,
        message: 'User sudah terdaftar, ganti username dan email.',
      };
    }

    return {
      success: false,
      message: 'Terjadi kesalahan koneksi atau server.',
    };
  }
};

export const loginUser = async (data: loginType) => {
    try{
        const res = await login(data);
        if(res.status === 200){
            await setToken(res.data.token.toString());
            return res.data
        }
        if(res.status === 400){
            return 'Username atau password salah'
        }
    }catch(e: any){
        // alert(`ERROR FULL: ${e}`);
        // alert(`ERROR RESPONSE: ${e?.response}`);
        // alert(`ERROR MESSAGE: ${e?.message}`);
        // alert(e?.message);
        throw e;
    }
}

export const GetDataUser = () => {
    const [dataUser, setDataUser] = useState<userGetType[]>([])

    useEffect(()=>{
        const fetch = async() => {
            const res = await getUser();
            if(res.status === 200){
                setDataUser(res.data);
            }
        }
        fetch();
    },[])

    useEffect(()=>{
        // alert(`dataUser: ${JSON.stringify(dataUser)}`)
    },[])
    
    return { dataUser }
}