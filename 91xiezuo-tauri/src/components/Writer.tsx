import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

export default function Writer() {
  const [title, setTitle] = useState('未命名小说')
  const [activeTab, setActiveTab] = useState('edit')

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  })

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold border-none px-0 focus-visible:ring-0"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList>
          <TabsTrigger value="edit">编辑</TabsTrigger>
          <TabsTrigger value="characters">人物</TabsTrigger>
          <TabsTrigger value="world">世界观</TabsTrigger>
          <TabsTrigger value="corpus">语料库</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="h-[calc(100%-60px)]">
          <Card className="h-full">
            {editor && (
              <div className="h-full">
                <div className="border-b p-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                  >
                    加粗
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                  >
                    斜体
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  >
                    H1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  >
                    H2
                  </Button>
                </div>
                <EditorContent editor={editor} className="prose max-w-none p-4 h-[calc(100%-50px)] overflow-auto" />
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="characters">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">人物设定</h2>
            <p className="text-muted-foreground">人物管理功能开发中...</p>
          </Card>
        </TabsContent>

        <TabsContent value="world">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">世界观设定</h2>
            <p className="text-muted-foreground">世界观管理功能开发中...</p>
          </Card>
        </TabsContent>

        <TabsContent value="corpus">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">语料库</h2>
            <p className="text-muted-foreground">语料库管理功能开发中...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
