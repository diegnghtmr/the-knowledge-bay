import React, { useState, useRef } from "react";
import { ThumbsUp, MessageCircle, Link as LinkIcon, HelpCircle, FileText, Video } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ReactPlayer from 'react-player/lazy';

const PostItem = ({
  post,
  onLike,
  onCommentSubmit,
  commentText,
  onCommentChange,
}) => {
  const [showComments, setShowComments] = useState(false);
  const commentInputRef = useRef(null);

  const renderPostContent = () => {
    switch (post.type) {
      case "markdown":
        switch (post.actualContentType) {
          case "VIDEO":
            return (
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                {post.title && <h3 className="font-semibold text-lg p-3 bg-gray-50 text-[var(--deep-sea)]">{post.title}</h3>}
                {post.videoUrl ? (
                  <div className="player-wrapper aspect-video">
                    <ReactPlayer 
                      url={post.videoUrl} 
                      className="react-player"
                      controls 
                      width="100%" 
                      height="100%" 
                    />
                  </div>
                ) : (
                  <p className="p-3 text-red-500">
                    No se pudo cargar el video. Verifique la URL.
                  </p>
                )}
                {post.content && (
                  <div className="prose prose-sm sm:prose-base max-w-none break-words text-gray-700 p-3">
                     <ReactMarkdown>{post.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            );
          case "LINK":
            return (
              <a
                href={post.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group border border-gray-200"
              >
                <div className="flex items-center mb-2">
                  <LinkIcon size={20} className="mr-2 text-[var(--coastal-sea)] group-hover:text-[var(--open-sea)] flex-shrink-0" />
                  <h3 className="font-semibold text-lg text-[var(--coastal-sea)] group-hover:text-[var(--open-sea)] break-all">
                    {post.title || post.linkUrl}
                  </h3>
                </div>
                {post.content && (
                    <div className="prose prose-sm sm:prose-base max-w-none break-words text-gray-700 group-hover:text-gray-800">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </div>
                )}
                {!post.content && <p className="text-sm text-gray-700 group-hover:text-gray-800 break-all">{post.linkUrl}</p>}
              </a>
            );
          case "RESOURCE":
            return (
              <div className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group border border-blue-200">
                <div className="flex items-center mb-2">
                  <FileText size={20} className="mr-2 text-blue-600 group-hover:text-blue-700 flex-shrink-0" />
                  <h3 className="font-semibold text-lg text-blue-700 group-hover:text-blue-800 break-all">
                    {post.title || post.fileName}
                  </h3>
                </div>
                {post.fileName && <p className="text-sm text-blue-700 mb-1">Archivo: {post.fileName}</p>}
                {post.content && (
                    <div className="prose prose-sm sm:prose-base max-w-none break-words text-blue-800 group-hover:text-blue-900">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </div>
                )}
              </div>
            );
          case "MARKDOWN":
          default:
            return (
              <div className="p-4 border border-gray-200 rounded-lg">
                {post.title && <h3 className="font-semibold text-lg mb-2 text-[var(--deep-sea)]">{post.title}</h3>}
                <div className="prose prose-sm sm:prose-base max-w-none break-words text-gray-700">
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
              </div>
            );
        }
      case "helprequest":
        return (
          <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
            <div className="flex items-start mb-2">
              <HelpCircle
                size={24}
                className="mr-3 text-yellow-500 flex-shrink-0 mt-1"
              />
              <div>
                <h3 className="font-semibold text-lg text-yellow-700">
                  Solicitud de Ayuda: {post.title || "Detalles"} 
                </h3>
                <div className="prose prose-sm sm:prose-base max-w-none break-words text-yellow-800">
                   <ReactMarkdown>{post.details || post.question}</ReactMarkdown>
                </div>
              </div>
            </div>
            <p className="text-xs text-yellow-600 mt-1 ml-9">Urgencia: {post.urgency}</p>
          </div>
        );
      default:
        return <p className="text-red-500">Tipo de post desconocido.</p>;
    }
  };

  return (
    <article className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-start mb-3">
        <div className="flex-grow">
          <p className="font-semibold text-sm sm:text-base text-[var(--deep-sea)]">
            {post.author.name}
          </p>
          <p className="text-xs text-gray-500">{post.timestamp}</p>
        </div>
      </div>

      <div className="mb-4 post-content">{renderPostContent()}</div>

      <div className="flex items-center justify-between text-gray-500 border-t border-gray-200 pt-3">
        <button
          onClick={onLike}
          className={`flex items-center space-x-1 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-gray-100 ${
            post.likedByMe ? "text-red-500" : ""
          }`}
        >
          <ThumbsUp size={18} />
          <span>{post.likes} Me gusta</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 hover:text-[var(--coastal-sea)] transition-colors p-2 rounded-md hover:bg-gray-100"
        >
          <MessageCircle size={18} />
          <span>{post.comments?.length || 0} Comentarios</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold mb-3 text-[var(--deep-sea)]">
            Comentarios:
          </h4>
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {post.comments.filter(comment => comment !== null && comment !== undefined).map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start text-xs bg-gray-50 p-2 rounded-md"
                >
                  <div className="flex-grow">
                    <span className="font-semibold text-[var(--deep-sea)]">
                      {comment.author?.name || 'Usuario Desconocido'}:
                    </span>
                    <span className="text-gray-700 break-words">
                      {" "}
                      {comment.text || ''}
                    </span>
                    {comment.timestamp && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {comment.timestamp}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              No hay comentarios aún. ¡Sé el primero!
            </p>
          )}
          <div className="mt-3 flex items-center">
            <input
              ref={commentInputRef}
              type="text"
              value={commentText}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-grow p-2 text-xs bg-white border border-gray-300 rounded-l-md focus:ring-1 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)] outline-none text-gray-700 placeholder-gray-400"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  onCommentSubmit();
                  e.preventDefault();
                }
              }}
            />
            <button
              onClick={onCommentSubmit}
              className="bg-[var(--coastal-sea)] hover:bg-[var(--open-sea)] text-white px-3 py-2 text-xs rounded-r-md transition-colors"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default PostItem; 