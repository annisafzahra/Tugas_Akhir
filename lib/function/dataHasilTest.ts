import { DataHasilTesType } from '@/type/dataHasilTestType'
import React, { useEffect, useState } from 'react'
import { getHasilTes } from './api'

const dataHasilTest = () => {
    const [hasilTest, setHasilTest] = useState<DataHasilTesType[]>([])

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
        console.error('Hasil Tes Updated:', hasilTest?.length ?? 0)
    }, [hasilTest])
    return {hasilTest}

}

export default dataHasilTest