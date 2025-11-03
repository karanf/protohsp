import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  // Chrome DevTools workspace configuration
  const devToolsConfig = {
    version: "1.0",
    workspace: {
      root: path.resolve(process.cwd()),
      name: "Educatius App",
      uuid: "educatius-workspace-uuid-001"
    },
    mappings: [
      {
        url: "http://localhost:3000/",
        path: path.resolve(process.cwd(), "app")
      }
    ]
  };

  return NextResponse.json(devToolsConfig, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
} 