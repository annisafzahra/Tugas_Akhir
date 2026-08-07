import { DataHasilTesType } from '@/type/dataHasilTestType'
import React, { useEffect, useState } from 'react'
import { getHasilTes, getHasilTesSiswa } from './api'

const dataHasilTest = (idSiswa?: number) => {
    const [hasilTest, setHasilTest] = useState<DataHasilTesType[]>([])
    const [hasilTestSiswa, setHasilTestSiswa] = useState<DataHasilTesType[]>([])

    useEffect(()=>{
        const fetchHasilTes = async () => {
            try {
                const response = await getHasilTes();
                setHasilTest(response.data)
            } catch (error) {
                console.error('Error fetching hasil tes:', error)
            }
        }
        fetchHasilTes()
    }, [])
    
    useEffect(()=>{
        const fetchHasilTesSiswa = async () => {
            try {
                const response = await getHasilTesSiswa(idSiswa||0);
                setHasilTestSiswa(response.data)
            } catch (error) {
                console.error('Error fetching hasil tes siswa:', error)
            }
        }
        fetchHasilTesSiswa()
    }, [idSiswa])

    useEffect(()=>{
        console.error('Hasil Tes Updated:', hasilTest?.length ?? 0)
    }, [hasilTest])


    return {hasilTest,hasilTestSiswa}

}

export default dataHasilTest