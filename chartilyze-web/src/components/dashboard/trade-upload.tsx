// src/components/dashboard/trade-upload.tsx
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

export function TradeUpload() {
  return (
    <Card className="p-6">
      <div className="text-center">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">
          Upload Trade Screenshot
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Drop your chart screenshot here or click to browse
        </p>
        <Button variant="outline">
          Choose File
        </Button>
      </div>
    </Card>
  )
}
