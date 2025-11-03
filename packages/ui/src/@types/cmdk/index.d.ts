declare module 'cmdk' {
  import * as React from 'react';

  export interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
    loop?: boolean;
    shouldFilter?: boolean;
    filter?: (value: string, search: string) => number;
    value?: string;
    onValueChange?: (value: string) => void;
    children?: React.ReactNode;
  }

  export interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    children?: React.ReactNode;
  }

  export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
  }

  export interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
    onSelect?: (value: string) => void;
    value?: string;
    children?: React.ReactNode;
  }

  export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    heading?: React.ReactNode;
    children?: React.ReactNode;
  }

  export interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
  }

  export interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
  }

  export class Command extends React.Component<CommandProps> {
    static Input: React.FC<CommandInputProps>;
    static List: React.FC<CommandListProps>;
    static Item: React.FC<CommandItemProps>;
    static Group: React.FC<CommandGroupProps>;
    static Separator: React.FC<CommandSeparatorProps>;
    static Empty: React.FC<CommandEmptyProps>;
  }
}
