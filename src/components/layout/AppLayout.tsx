import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  FileText,
  LogOut,
  Menu,
  Store,
  PackageCheck,
  TruckElectric,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Productos', path: '/products', icon: Package },
    { name: 'Proveedores', path: '/suppliers', icon: Truck },
    { name: 'Clientes', path: '/customers', icon: Users },
    { name: 'Órdenes de Compra', path: '/purchase-orders', icon: ShoppingCart },
    { name: 'Ingresos', path: '/goods-receipts', icon: PackageCheck },
    { name: 'Facturación', path: '/invoices', icon: FileText },
    { name: 'Despachos', path: '/dispatches', icon: TruckElectric },
    { name: 'Almacenes', path: '/inventory', icon: Store },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden w-64 flex-col border-r bg-muted/20 md:flex">
        <div className="flex h-14 items-center border-b px-4 font-bold text-primary">
          <Package className="mr-2 h-5 w-5" />
          INVENTARIO ERP
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {navItems.map((item) => {
              const isActive =
                item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive ? 'bg-muted text-primary' : '',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground">
            <span className="truncate flex-1">{user?.fullName}</span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">{user?.role}</span>
          </div>
          <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/20 px-4 md:hidden">
          <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div className="flex-1 font-bold text-primary">Yuntas ERP</div>
        </header>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex bg-background/80 backdrop-blur-sm md:hidden">
            <div className="w-64 border-r bg-background p-4">
              <Button variant="ghost" className="mb-4" onClick={() => setSidebarOpen(false)}>
                Cerrar menú
              </Button>
              <nav className="grid gap-2 text-sm font-medium">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 rounded-lg px-3 py-2"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-1" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
