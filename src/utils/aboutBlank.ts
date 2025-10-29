interface DisguiseOptions {
  title?: string;
  favicon?: string;
}

export const openInAboutBlank = (disguise?: DisguiseOptions) => {
  const aboutBlankWindow = window.open('about:blank', '_blank');
  
  if (aboutBlankWindow) {
    const disguiseTitle = disguise?.title || 'about:blank';
    const faviconHtml = disguise?.favicon 
      ? `<link rel="icon" type="image/x-icon" href="${disguise.favicon}">
         <link rel="shortcut icon" type="image/x-icon" href="${disguise.favicon}">`
      : '';
    
    aboutBlankWindow.document.open();
    aboutBlankWindow.document.write(`<!DOCTYPE html>
                    <html>
                    <head>
                        <title>${disguiseTitle}</title>
                        ${faviconHtml}
                        <style>
                            body { margin: 0; overflow: hidden; }
                            iframe { width: 100vw; height: 100vh; border: none; }
                        </style>
                    </head>
                    <body>
                        <iframe src="${window.location.href}"></iframe>
                    </body>
                    </html>`);
    aboutBlankWindow.document.close();
  } else {
    alert('Please allow popups for this site to use About:Blank mode.');
  }
};
