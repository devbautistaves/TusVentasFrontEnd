"use client"

import { Building2, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCompany } from "@/lib/company-context"

export function CompanySelector() {
  const { currentCompany, companies, switchCompany } = useCompany()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-border/50 bg-secondary/30 hover:bg-secondary/50"
        >
          <div
            className="h-6 w-6 rounded flex items-center justify-center"
            style={{ backgroundColor: currentCompany.primaryColor }}
          >
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="hidden sm:inline font-medium">{currentCompany.name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-muted-foreground font-normal text-xs uppercase tracking-wider">
          Cambiar Empresa
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => switchCompany(company.id)}
            className="flex items-center gap-3 cursor-pointer py-2.5"
          >
            <div
              className="h-8 w-8 rounded flex items-center justify-center"
              style={{ backgroundColor: company.primaryColor }}
            >
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{company.name}</p>
              <p className="text-xs text-muted-foreground">{company.displayName}</p>
            </div>
            {currentCompany.id === company.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
