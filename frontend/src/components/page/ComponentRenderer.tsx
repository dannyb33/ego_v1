import React from 'react';
import { AnyComponent, ComponentType, BioComponent, TextComponent } from '@/types';

interface ComponentRendererProps {
  component: AnyComponent;
  customizerOpen?: boolean;
  onDelete?: () => void;
}

// Individual component renderers
const BioComponentRenderer: React.FC<{ component: BioComponent; customizerOpen?: boolean; onDelete?: () => void }> = ({ component, customizerOpen, onDelete }) => {
  return (
    <div className="relative bg-[var(--color-raisin-black)] rounded-lg shadow-md p-6 mb-4">
      {customizerOpen && (
        <button
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-bright-pink-crayola)] text-[var(--color-baby-powder)] cursor-pointer text-3xl font-bold shadow-md hover:bg-[var(--color-baby-powder)] hover:text-[var(--color-bright-pink-crayola)] transition"
          onClick={onDelete}
        >
          <span className="drop-shadow-lg relative -top-0.25">-</span>
        </button>
      )}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {component.displayName}
        </h2>
        <p className="text-gray-100 mb-4">@{component.username}</p>
        <p className="text-gray-100 mb-6">{component.bio}</p>

        <div className="flex justify-center space-x-8 text-sm">
          <div className="text-center">
            <div className="font-bold text-lg text-white">{component.postCount}</div>
            <div className="text-gray-400">Posts</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-white">{component.followerCount}</div>
            <div className="text-gray-400">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-white">{component.followingCount}</div>
            <div className="text-gray-400">Following</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TextComponentRenderer: React.FC<{
  component: TextComponent;
  customizerOpen?: boolean;
  onDelete?: () => void;
}> = ({ component, customizerOpen, onDelete }) => {
  return (
    <div
      className="relative rounded-lg shadow-md p-10 mb-4"
      style={{
        backgroundColor: component.backgroundColor,
        fontFamily: component.font
      }}
    >
      {customizerOpen && (
        <button
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-bright-pink-crayola)] text-[var(--color-baby-powder)] cursor-pointer text-3xl font-bold shadow-md hover:bg-[var(--color-baby-powder)] hover:text-[var(--color-bright-pink-crayola)] transition"
          onClick={onDelete}
        >
          <span className="drop-shadow-lg relative -top-0.25">-</span>
        </button>
      )}
      <p className="text-center text-gray-900 whitespace-pre-wrap">{component.text}</p>
    </div>
  );
};

// const LinkComponentRenderer: React.FC<{ component: LinkComponent }> = ({ component }) => {
//   return (
//     <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
//       <a
//         href={component.url}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="block"
//       >
//         <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 mb-2">
//           {component.title}
//         </h3>
//         <p className="text-gray-500 text-sm">{component.url}</p>
//       </a>
//     </div>
//   );
// };

// const ImageComponentRenderer: React.FC<{ component: ImageComponent }> = ({ component }) => {
//   return (
//     <div className="bg-white rounded-lg shadow-md p-4 mb-4">
//       <img
//         src={component.imageUrl}
//         alt={component.altText}
//         className="w-full h-auto rounded-lg"
//         loading="lazy"
//       />
//       {component.altText && (
//         <p className="text-gray-500 text-sm mt-2 text-center">{component.altText}</p>
//       )}
//     </div>
//   );
// };

// Main component renderer that delegates to specific renderers
export const ComponentRenderer: React.FC<ComponentRendererProps> = ({ component, customizerOpen, onDelete }) => {
  switch (component.componentType) {
    case ComponentType.BIO:
      return <BioComponentRenderer component={component as BioComponent} customizerOpen={customizerOpen} onDelete={onDelete} />;

    case ComponentType.TEXT:
      return <TextComponentRenderer component={component as TextComponent} customizerOpen={customizerOpen} onDelete={onDelete} />;

    // case ComponentType.LINK:
    //   return <LinkComponentRenderer component={component as LinkComponent} />;

    // case ComponentType.IMAGE:
    //   return <ImageComponentRenderer component={component as ImageComponent} />;

    default:
      return (
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <p className="text-gray-500">
            Unknown component type: {(component as AnyComponent).componentType ?? 'undefined'}
          </p>
        </div>
      );
  }
};

export default ComponentRenderer;