"use client";

import * as React from "react";
import { cn } from "@repo/ui/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/ui/alert-dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/ui/alert";
import { AspectRatio } from "@repo/ui/components/ui/aspect-ratio";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/ui/breadcrumb";
import { Button } from "@repo/ui/components/ui/button";
import {
  Calendar,
} from "@repo/ui/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/components/ui/carousel";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  CollapsibleTriggerWithIcon,
} from "@repo/ui/components/ui/collapsible";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@repo/ui/components/ui/command";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@repo/ui/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/ui/components/ui/hover-card";
import { Input } from "@repo/ui/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui/components/ui/input-otp";
import { Label } from "@repo/ui/components/ui/label";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@repo/ui/components/ui/menubar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@repo/ui/components/ui/navigation-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { Progress } from "@repo/ui/components/ui/progress";
import {
  RadioGroup,
  RadioGroupItem,
} from "@repo/ui/components/ui/radio-group";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@repo/ui/components/ui/resizable";
import {
  ScrollArea,
  ScrollBar,
} from "@repo/ui/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Separator } from "@repo/ui/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/ui/sheet";
import { Sidebar } from "@repo/ui/components/ui/sidebar";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Slider } from "@repo/ui/components/ui/slider";
import { Switch } from "@repo/ui/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
  Toggle,
  toggleVariants,
} from "@repo/ui/components/ui/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@repo/ui/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { DatePickerDemo } from "@repo/ui/components/ui/date-picker";
import { Toaster } from "@repo/ui/components/ui/sonner";

export default function ComponentLibrary() {
  const [activeTab, setActiveTab] = React.useState("all");
  const [activeTheme, setActiveTheme] = React.useState("default");
  const today = new Date();

  const handleThemeChange = (theme: string) => {
    setActiveTheme(theme);
    if (theme === "default") {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.style.removeProperty("--primary");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
      if (theme === "greenheart") {
        document.documentElement.style.setProperty("--primary", "var(--greenheart-aloe-600)");
      } else if (theme === "educatius") {
        document.documentElement.style.setProperty("--primary", "var(--educatius-teal-600)");
      }
    }
  };

  const components = [
    {
      id: "accordion",
      name: "Accordion",
      component: (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is it styled?</AccordionTrigger>
            <AccordionContent>
              Yes. It comes with default styles that matches the other components.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )
    },
    {
      id: "alert",
      name: "Alert",
      component: (
        <Alert>
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components to your app using the CLI.
          </AlertDescription>
        </Alert>
      )
    },
    {
      id: "alert-dialog",
      name: "Alert Dialog",
      component: (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="tertiary">Show Dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    },
    {
      id: "aspect-ratio",
      name: "Aspect Ratio",
      component: (
        <AspectRatio ratio={16 / 9} className="bg-slate-200 flex items-center justify-center">
          <div className="text-sm text-slate-600">16:9 Aspect Ratio</div>
        </AspectRatio>
      )
    },
    {
      id: "avatar",
      name: "Avatar",
      component: (
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      )
    },
    {
      id: "badge",
      name: "Badge",
      component: (
        <div className="flex gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      )
    },
    {
      id: "button",
      name: "Button",
      component: (
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      )
    },
    {
      id: "calendar",
      name: "Calendar",
      component: (
        <Calendar
          mode="single"
          selected={today}
          className="rounded-md border"
        />
      )
    },
    {
      id: "card",
      name: "Card",
      component: (
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
      )
    },
    {
      id: "checkbox",
      name: "Checkbox",
      component: (
        <div className="items-top flex space-x-2">
          <Checkbox id="terms" />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="terms">Accept terms and conditions</Label>
          </div>
        </div>
      )
    },
    {
      id: "collapsible",
      name: "Collapsible",
      component: (
        <Collapsible className="w-full">
          <CollapsibleTriggerWithIcon>
            Can I use this in my project?
          </CollapsibleTriggerWithIcon>
          <CollapsibleContent className="px-4 py-2 text-sm text-muted-foreground">
            Yes. Free to use for personal and commercial projects. No attribution required.
          </CollapsibleContent>
        </Collapsible>
      )
    },
    {
      id: "date-picker",
      name: "Date Picker",
      component: (
        <DatePickerDemo />
      )
    },
    {
      id: "dialog",
      name: "Dialog",
      component: (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="tertiary">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  defaultValue="Pedro Duarte"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    },
    {
      id: "dropdown-menu",
      name: "Dropdown Menu",
      component: (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="tertiary">Open</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    {
      id: "input",
      name: "Input",
      component: (
        <Input placeholder="Enter text here..." />
      )
    },
    {
      id: "input-otp",
      name: "Input OTP",
      component: (
        <InputOTP maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      )
    },
    {
      id: "label",
      name: "Label",
      component: (
        <div className="flex items-center space-x-2">
          <Label htmlFor="example">Example label</Label>
          <Input id="example" />
        </div>
      )
    },
    {
      id: "popover",
      name: "Popover",
      component: (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="tertiary">Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Dimensions</h4>
                <p className="text-sm text-muted-foreground">
                  Set the dimensions for the layer.
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )
    },
    {
      id: "progress",
      name: "Progress",
      component: (
        <Progress value={60} className="w-full" />
      )
    },
    {
      id: "radio-group",
      name: "Radio Group",
      component: (
        <RadioGroup defaultValue="default">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="default" id="r1" />
            <Label htmlFor="r1">Default</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="comfortable" id="r2" />
            <Label htmlFor="r2">Comfortable</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="compact" id="r3" />
            <Label htmlFor="r3">Compact</Label>
          </div>
        </RadioGroup>
      )
    },
    {
      id: "select",
      name: "Select",
      component: (
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
              <SelectItem value="grapes">Grapes</SelectItem>
              <SelectItem value="pineapple">Pineapple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )
    },
    {
      id: "separator",
      name: "Separator",
      component: (
        <div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
            <p className="text-sm text-muted-foreground">
              An open-source UI component library.
            </p>
          </div>
          <Separator className="my-4" />
          <div className="flex h-5 items-center space-x-4 text-sm">
            <div>Blog</div>
            <Separator orientation="vertical" />
            <div>Docs</div>
            <Separator orientation="vertical" />
            <div>Source</div>
          </div>
        </div>
      )
    },
    {
      id: "skeleton",
      name: "Skeleton",
      component: (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      )
    },
    {
      id: "slider",
      name: "Slider",
      component: (
        <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
      )
    },
    {
      id: "switch",
      name: "Switch",
      component: (
        <div className="flex items-center space-x-2">
          <Switch id="airplane-mode" />
          <Label htmlFor="airplane-mode">Airplane Mode</Label>
        </div>
      )
    },
    {
      id: "table",
      name: "Table",
      component: (
        <Table>
          <TableCaption>A list of recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">INV001</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell className="text-right">$250.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">INV002</TableCell>
              <TableCell>Pending</TableCell>
              <TableCell>PayPal</TableCell>
              <TableCell className="text-right">$150.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
    },
    {
      id: "tabs",
      name: "Tabs",
      component: (
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">Account content</TabsContent>
          <TabsContent value="password">Password content</TabsContent>
        </Tabs>
      )
    },
    {
      id: "textarea",
      name: "Textarea",
      component: (
        <Textarea placeholder="Type your message here." />
      )
    },
    {
      id: "toggle",
      name: "Toggle",
      component: (
        <div className="flex gap-2">
          <Toggle>Toggle</Toggle>
          <Toggle variant="outline">Outline</Toggle>
        </div>
      )
    },
    {
      id: "toggle-group",
      name: "Toggle Group",
      component: (
        <ToggleGroup type="single">
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      )
    },
    {
      id: "tooltip",
      name: "Tooltip",
      component: (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="tertiary">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add to library</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  ];

  const filteredComponents = activeTab === "all" 
    ? components 
    : components.filter(c => c.id === activeTab);

  return (
    <div className="min-h-screen bg-zinc-50/40">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4 md:px-6">
          <div className="font-medium">Component Library</div>
        </div>
      </header>

      <div className="container px-4 py-10 md:px-6 md:py-12">
        <div className="mb-12 space-y-3">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            UI Component Library
          </h1>
          <p className="text-muted-foreground max-w-2xl text-balance">
            A comprehensive showcase of all available UI components based on shadcn/ui with Tailwind v4. 
            Click on any component to view its individual showcase or browse the entire collection.
          </p>
          
          <div className="mt-6">
            <p className="text-sm font-medium mb-2">Theme</p>
            <div className="flex items-center gap-4">
              <Tabs value={activeTheme} onValueChange={handleThemeChange} className="w-full max-w-md">
                <TabsList>
                  <TabsTrigger value="default">Default</TabsTrigger>
                  <TabsTrigger value="educatius">Educatius</TabsTrigger>
                  <TabsTrigger value="greenheart">Greenheart</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2">
                <span className="text-sm">Current theme:</span>
                <div 
                  className="size-6 rounded-full border"
                  style={{ 
                    backgroundColor: activeTheme === "default" ? "var(--primary)" : 
                                    activeTheme === "greenheart" ? "var(--greenheart-aloe-600)" : 
                                    "var(--educatius-teal-600)" 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="overflow-auto border-b pb-2">
            <TabsList className="h-auto p-0 bg-transparent inline-flex flex-wrap gap-2">
              <TabsTrigger 
                value="all" 
                className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                All Components
              </TabsTrigger>
              {components.map((component) => (
                <TabsTrigger 
                  key={component.id} 
                  value={component.id}
                  className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {component.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComponents.map((component) => (
              <Card 
                key={component.id} 
                id={component.id} 
                className="overflow-hidden border border-border/60 transition-all hover:shadow-md group"
              >
                <CardHeader className="bg-muted/20 group-hover:bg-muted/40 transition-colors">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {component.name}
                    <Badge variant="outline" className="text-xs font-normal">
                      {component.id}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-8 border-t min-h-48">
                  <div className="w-full">
                    {component.component}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Tabs>
      </div>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:h-16 items-center justify-between gap-4 md:flex-row px-4 md:px-6">
          <p className="text-center text-sm text-muted-foreground">
            Built with shadcn/ui components and Tailwind v4
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
