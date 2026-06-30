import { UserType } from '@/type/dataHasilTestType';
import React, { useEffect, useState } from 'react'
import { deleteSiswa, getListSiswa } from './api';

const dataUserFunction = () => {
    const [dataUser, setDataUser] = useState<UserType[]>([]);

    useEffect(()=>{
        const fetchDataUser = async () => {
            try {
                const response = await getListSiswa();
                if(response.status === 200){
                    setDataUser(response.data);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
        fetchDataUser();
    },[]);

    useEffect(()=>{
        alert(`dataUser: ${JSON.stringify(dataUser)}`)
    }, [dataUser])
    
    return { dataUser };
}
export default dataUserFunction

export const GetDataUser = async (id:number) => {
    try{
        const res = await deleteSiswa(id);
        if(res.status === 204){
            alert('User berhasil dihapus');
        }
    }catch{
        alert('Gagal menghapus user');
    }
}