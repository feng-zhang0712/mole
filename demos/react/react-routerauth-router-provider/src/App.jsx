import React from 'react';
import {
  Form,
  Link,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  redirect,
  useActionData,
  useFetcher,
  useLocation,
  useNavigate,
  useRouteLoaderData,
} from 'react-router-dom';
import { fakeAuthProvider } from './auth';

const router = createBrowserRouter([
  {
    id: 'root',
    path: '/',
    loader () {
      return {
        user: fakeAuthProvider.username,
      };
    },
    Component: Layout,
    children: [
      {
        index: true,
        Component: PublicPage,
      },
      {
        path: 'login',
        Component: LoginPage,
      },
      {
        path: 'protected',
        Component: ProtectedPage,
      },
    ],
  },
]);

export default function App () {

};

function Layout() {
  
}

function LoginPage() {
  
}

function PublicPage() {
  
}

function ProtectedPage() {
  
}