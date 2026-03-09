import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useNovelStore } from '@/store/novelStore'
import { Button } from './ui/button'
import {
  Menu,
  X,
  Home,
  BookOpen,
  MessageSquare,
  Wrench,
  List,
  Target,
  DollarSign,
  FileText,
  Library,
  Settings,
  PenTool,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const menuItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/writer/:novelId', icon: PenTool, label: '编辑器' },
  { path: '/novels', icon: BookOpen, label: '小说管理' },
  { path: '/prompts', icon: MessageSquare, label: '提示词库' },
  { path: '/tools', icon: Wrench, label: '工具库' },
  { path: '/chapters', icon: List, label: '章节管理' },
  { path: '/goals', icon: Target, label: '写作目标' },
  { path: '/billing', icon: DollarSign, label: 'Token计费' },
  { path: '/short-story', icon: FileText, label: '短文写作' },
  { path: '/book-analysis', icon: Library, label: '拆书工具' },
  { path: '/genres', icon: BookOpen, label: '类型管理' },
  { path: '/settings', icon: Settings, label: '系统设置' },
]

export default function Dashboard() {
  const { sidebarCollapsed, toggleSidebar, darkMode, toggleDarkMode } = useNovelStore()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      {/* 侧边栏 */}
      <aside
        className={`
          bg-background border-r transition-all duration-300
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-foreground">91写作</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-auto"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path.replace(':novelId', '')))

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                      ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                      ${sidebarCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* 底部操作 */}
        <div className="p-4 border-t space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className={`w-full ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            {darkMode ? '☀️' : '🌙'}
            {!sidebarCollapsed && <span className="ml-2">切换主题</span>}
          </Button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 移动端菜单按钮 */}
        <div className="md:hidden flex items-center p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <h1 className="ml-4 text-xl font-bold">91写作</h1>
        </div>

        {/* 内容区域 */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* 移动端侧边栏 */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-background border-r p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
