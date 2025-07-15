"use client"

import { useEffect } from "react"

export default function GenerateIcons() {
  useEffect(() => {
    // This component generates placeholder icons on the client side
    const sizes = [
      { size: 192, name: 'icon-192.png' },
      { size: 512, name: 'icon-512.png' },
      { size: 180, name: 'apple-icon.png' }
    ]

    sizes.forEach(({ size, name }) => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, size, size)
        gradient.addColorStop(0, '#4169E1')
        gradient.addColorStop(1, '#1e3c72')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, size, size)
        
        // Draw "8" in the center
        ctx.fillStyle = '#ffffff'
        ctx.font = `bold ${size * 0.5}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('8', size / 2, size / 2)
        
        // Note: In a real app, you'd save these to the server
        // For now, we'll just log that they should be created
        console.log(`Icon ${name} should be created at ${size}x${size}`)
      }
    })
  }, [])

  return null
}