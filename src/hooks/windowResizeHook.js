import { useEffect, useState } from "react"

export default function useWindowDimensions () {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    function handleResize () {
      console.log('RESIZE')
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)

  }, [])


  return [size.width, size.height]
}
