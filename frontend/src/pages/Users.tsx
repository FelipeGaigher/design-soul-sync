import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Loader2,
  User,
  MoreHorizontal,
  Pencil,
  Trash2,
  Shield,
  Search,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  createdAt: string;
}

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "ux_designer", label: "UX Designer" },
  { value: "frontend_dev", label: "Frontend Developer" },
  { value: "viewer", label: "Visualizador" },
];

const PERMISSIONS = [
  { value: "view_components", label: "Visualizar componentes" },
  { value: "edit_components", label: "Editar componentes" },
  { value: "delete_components", label: "Excluir componentes" },
  { value: "import_figma", label: "Importar do Figma" },
  { value: "manage_users", label: "Gerenciar usuarios" },
];

export default function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "viewer",
    permissions: ["view_components"] as string[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      // Mock data for demonstration - replace with actual API call
      // const res = await fetch("/api/users", {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      // Mock users
      setUsers([
        {
          id: "1",
          name: "Joao Silva",
          email: "joao@empresa.com",
          role: "frontend_dev",
          permissions: ["view_components", "edit_components"],
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Maria Santos",
          email: "maria@empresa.com",
          role: "ux_designer",
          permissions: ["view_components", "edit_components", "import_figma"],
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Admin",
          email: "admin@empresa.com",
          role: "admin",
          permissions: ["view_components", "edit_components", "delete_components", "import_figma", "manage_users"],
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.error("Error fetching users:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.email) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      // Mock create - replace with actual API call
      const newUser: UserData = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions,
        createdAt: new Date().toISOString(),
      };

      setUsers([...users, newUser]);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (e) {
      console.error("Error creating user:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedUser || !formData.name || !formData.email) return;

    setSaving(true);
    try {
      const updatedUsers = users.map((u) =>
        u.id === selectedUser.id
          ? { ...u, name: formData.name, email: formData.email, role: formData.role, permissions: formData.permissions }
          : u
      );
      setUsers(updatedUsers);
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
    } catch (e) {
      console.error("Error updating user:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (e) {
      console.error("Error deleting user:", e);
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "viewer",
      permissions: ["view_components"],
    });
  };

  const togglePermission = (permission: string) => {
    if (formData.permissions.includes(permission)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter((p) => p !== permission),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permission],
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "ux_designer":
        return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400";
      case "frontend_dev":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getRoleLabel = (role: string) => {
    return ROLES.find((r) => r.value === role)?.label || role;
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedUser(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Editar Usuario" : "Novo Usuario"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? "Atualize as informacoes do usuario."
                : "Cadastre um novo usuario no sistema."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Nome completo"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@empresa.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Permissoes</Label>
              <div className="space-y-2 rounded-lg border p-3">
                {PERMISSIONS.map((permission) => (
                  <div
                    key={permission.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={permission.value}
                      checked={formData.permissions.includes(permission.value)}
                      onCheckedChange={() => togglePermission(permission.value)}
                    />
                    <Label
                      htmlFor={permission.value}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                resetForm();
              }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={isEditDialogOpen ? handleEdit : handleCreate}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditDialogOpen ? "Salvar" : "Criar Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao nao pode ser desfeita. O usuario "{selectedUser?.name}"
              sera permanentemente removido do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Usuarios</h1>
            <p className="text-muted-foreground">
              Gerencie usuarios e suas permissoes no sistema.
            </p>
          </div>
          <Button
            size="lg"
            className="gap-2"
            onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Novo Usuario
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  Nenhum usuario encontrado
                </h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  {searchQuery
                    ? "Tente ajustar sua busca."
                    : "Cadastre seu primeiro usuario para comecar."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{user.name}</h3>
                        <Badge
                          variant="secondary"
                          className={getRoleBadgeColor(user.role)}
                        >
                          {getRoleLabel(user.role)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Shield className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {user.permissions.length} permissoes
                        </span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(user)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      {user.role !== "admin" && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openDeleteDialog(user)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
