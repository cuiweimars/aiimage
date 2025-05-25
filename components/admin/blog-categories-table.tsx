"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface BlogCategory {
  id: string
  name: string
  slug: string
}

interface BlogCategoriesTableProps {
  categories: BlogCategory[]
}

export function BlogCategoriesTable({ categories: initialCategories }: BlogCategoriesTableProps) {
  const t = useTranslations("BlogCategoriesTable")
  const router = useRouter()
  const { toast } = useToast()
  const [categories, setCategories] = useState<BlogCategory[]>(initialCategories)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<BlogCategory | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<BlogCategory | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategorySlug, setNewCategorySlug] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 处理删除分类
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/blog/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete category")
      }

      // 更新本地状态
      setCategories(categories.filter((category) => category.id !== categoryToDelete.id))

      toast({
        title: t("deleteSuccess.title"),
        description: t("deleteSuccess.description"),
      })

      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: t("deleteError.title"),
        description: t("deleteError.description"),
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // 处理添加分类
  const handleAddCategory = async () => {
    if (!newCategoryName || !newCategorySlug) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/blog/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCategoryName,
          slug: newCategorySlug,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add category")
      }

      const newCategory = await response.json()

      // 更新本地状态
      setCategories([...categories, newCategory])

      toast({
        title: t("addSuccess.title"),
        description: t("addSuccess.description"),
      })

      setIsAddDialogOpen(false)
      setNewCategoryName("")
      setNewCategorySlug("")
    } catch (error) {
      console.error("Error adding category:", error)
      toast({
        title: t("addError.title"),
        description: t("addError.description"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 处理编辑分类
  const handleEditCategory = async () => {
    if (!categoryToEdit || !newCategoryName || !newCategorySlug) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/blog/categories/${categoryToEdit.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCategoryName,
          slug: newCategorySlug,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update category")
      }

      const updatedCategory = await response.json()

      // 更新本地状态
      setCategories(categories.map((category) => (category.id === categoryToEdit.id ? updatedCategory : category)))

      toast({
        title: t("editSuccess.title"),
        description: t("editSuccess.description"),
      })

      setIsEditDialogOpen(false)
      setCategoryToEdit(null)
      setNewCategoryName("")
      setNewCategorySlug("")
    } catch (error) {
      console.error("Error updating category:", error)
      toast({
        title: t("editError.title"),
        description: t("editError.description"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 打开编辑对话框
  const openEditDialog = (category: BlogCategory) => {
    setCategoryToEdit(category)
    setNewCategoryName(category.name)
    setNewCategorySlug(category.slug)
    setIsEditDialogOpen(true)
  }

  // 生成slug
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">{t("totalCategories", { count: categories.length })}</div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("addCategory")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.name")}</TableHead>
              <TableHead>{t("columns.slug")}</TableHead>
              <TableHead className="w-[100px]">{t("columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t("openMenu")}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(category)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setCategoryToDelete(category)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  {t("noCategories")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 删除分类对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
            <DialogDescription>{t("deleteDialog.description")}</DialogDescription>
          </DialogHeader>
          {categoryToDelete && (
            <div className="py-4">
              <p className="font-medium">{categoryToDelete.name}</p>
              <p className="text-sm text-muted-foreground">{t("deleteDialog.warning")}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              {t("deleteDialog.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory} disabled={isDeleting}>
              {isDeleting ? t("deleteDialog.deleting") : t("deleteDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加分类对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addDialog.title")}</DialogTitle>
            <DialogDescription>{t("addDialog.description")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("addDialog.nameLabel")}</Label>
              <Input
                id="name"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value)
                  if (!newCategorySlug || newCategorySlug === generateSlug(newCategoryName)) {
                    setNewCategorySlug(generateSlug(e.target.value))
                  }
                }}
                placeholder={t("addDialog.namePlaceholder")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">{t("addDialog.slugLabel")}</Label>
              <Input
                id="slug"
                value={newCategorySlug}
                onChange={(e) => setNewCategorySlug(e.target.value)}
                placeholder={t("addDialog.slugPlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
              {t("addDialog.cancel")}
            </Button>
            <Button onClick={handleAddCategory} disabled={isSubmitting || !newCategoryName || !newCategorySlug}>
              {isSubmitting ? t("addDialog.adding") : t("addDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑分类对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editDialog.title")}</DialogTitle>
            <DialogDescription>{t("editDialog.description")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">{t("editDialog.nameLabel")}</Label>
              <Input
                id="edit-name"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value)
                  if (categoryToEdit && newCategorySlug === categoryToEdit.slug) {
                    setNewCategorySlug(generateSlug(e.target.value))
                  }
                }}
                placeholder={t("editDialog.namePlaceholder")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-slug">{t("editDialog.slugLabel")}</Label>
              <Input
                id="edit-slug"
                value={newCategorySlug}
                onChange={(e) => setNewCategorySlug(e.target.value)}
                placeholder={t("editDialog.slugPlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              {t("editDialog.cancel")}
            </Button>
            <Button onClick={handleEditCategory} disabled={isSubmitting || !newCategoryName || !newCategorySlug}>
              {isSubmitting ? t("editDialog.updating") : t("editDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
