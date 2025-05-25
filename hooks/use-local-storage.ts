"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // 状态用于在组件中存储值
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // 初始化时从localStorage读取值
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const item = window.localStorage.getItem(key)
        setStoredValue(item ? JSON.parse(item) : initialValue)
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      setStoredValue(initialValue)
    }
  }, [key, initialValue])

  // 返回一个包装函数，用于更新localStorage和状态
  const setValue = (value: T) => {
    try {
      // 允许值是一个函数，类似于useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // 保存到state
      setStoredValue(valueToStore)

      // 保存到localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}
