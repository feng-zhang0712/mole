import React from 'react';
import { Helmet } from 'react-helmet-async';
import './About.css';

function About() {
  return (
    <>
      <Helmet>
        <title>About - SSR React App</title>
        <meta name="description" content="Learn about our SSR React application and how it solves major challenges" />
        <meta property="og:title" content="About - SSR React App" />
        <meta property="og:description" content="Learn about our SSR React application and how it solves major challenges" />
      </Helmet>

      <div>
        <div>
          <h1>About SSR React App</h1>
          
          <section>
            <h2>What is Server-Side Rendering?</h2>
            <p>
              Server-Side Rendering (SSR) is a technique that renders React components on the server 
              before sending them to the client. This approach provides several benefits including 
              better SEO, faster initial page loads, and improved user experience.
            </p>
          </section>

          <section>
            <h2>Challenges We've Solved</h2>
            <div>
              <div>
                <h3>Data Fetching & State Sync</h3>
                <p>
                  Implemented efficient data fetching with server-side rendering and client-side hydration. 
                  Prevents duplicate API calls and ensures state consistency between server and client.
                </p>
              </div>
              
              <div>
                <h3>Routing Coordination</h3>
                <p>
                  Seamless routing between server and client using React Router. Handles dynamic routes, 
                  404 pages, and ensures consistent navigation experience.
                </p>
              </div>
              
              <div>
                <h3>Component Lifecycle</h3>
                <p>
                  Proper handling of React component lifecycles in SSR environment. Avoids browser-specific 
                  APIs on the server and ensures smooth hydration.
                </p>
              </div>
              
              <div>
                <h3>SEO Optimization</h3>
                <p>
                  Dynamic meta tags generation, structured data handling, and search engine compatibility. 
                  Ensures proper indexing and social media sharing.
                </p>
              </div>
              
              <div>
                <h3>Performance</h3>
                <p>
                  Code splitting, lazy loading, and optimized bundle strategies. Minimizes server overhead 
                  while maintaining fast client-side performance.
                </p>
              </div>
              
              <div>
                <h3>Error Handling</h3>
                <p>
                  Comprehensive error boundaries for both server and client. Graceful fallbacks and 
                  consistent error reporting across environments.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2>Technology Stack</h2>
            <div>
              <div>
                <strong>Frontend:</strong> React 18, React Router, Styled Components
              </div>
              <div>
                <strong>Backend:</strong> Node.js, Express.js
              </div>
              <div>
                <strong>Build Tools:</strong> Webpack 5, Babel
              </div>
              <div>
                <strong>Development:</strong> Hot Module Replacement, Concurrent Development
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default About;
