import {
  createBrowserRouter,
  RouterProvider,
  useLoaderData,
} from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    loader() {
      return {
        message: 'Hello Data Router!',
      };
    },
    Component() {
      const data = useLoaderData();
      return (
        <h1>{data.message}</h1>
      );
    }
  },
]);

export default function App() {
  return (
    <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}