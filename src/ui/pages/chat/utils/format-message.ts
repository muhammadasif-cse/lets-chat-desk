export const formatMessage = (text: string): string => {
  let formatted = text;

  formatted = formatted.replace(/\\u[\dA-F]{4}/gi, (match) => {
    try {
      return String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16));
    } catch {
      return match;
    }
  });

  formatted = formatted.replace(/\\n/g, "\n");

  formatted = formatted
    .replace(
      /^###### (.*)$/gm,
      '<h6 class="text-sm font-semibold mb-1 text-gray-900">$1</h6>'
    )
    .replace(
      /^##### (.*)$/gm,
      '<h5 class="text-base font-semibold mb-1 text-gray-900">$1</h5>'
    )
    .replace(
      /^#### (.*)$/gm,
      '<h4 class="text-lg font-semibold mb-2 text-gray-900">$1</h4>'
    )
    .replace(
      /^### (.*)$/gm,
      '<h3 class="text-xl font-semibold mb-2 text-gray-900">$1</h3>'
    )
    .replace(
      /^## (.*)$/gm,
      '<h2 class="text-lg font-bold mb-3 text-blue-600">$1</h2>'
    )
    .replace(
      /^# (.*)$/gm,
      '<h1 class="text-xl font-bold mb-4 text-green-600">$1</h1>'
    );

  formatted = formatted
    .replace(
      /\*\*([^*]+)\*\*/g,
      '<strong class="font-bold text-white">$1</strong>'
    )
    .replace(
      /\*([^*]+)\*/g,
      '<strong class="font-bold text-white">$1</strong>'
    );

  formatted = formatted.replace(
    /^-\s+(.*)$/gm,
    '<li class="ml-4 mb-1 flex items-start"><span class="text-green-400 mr-2">•</span><span>$1</span></li>'
  );

  formatted = formatted.replace(
    /((<li[^>]*>.*<\/li>\s*)+)/g,
    '<ul class="list-none space-y-1 my-3">$1</ul>'
  );

  formatted = formatted.replace(
    /```([^`]+)```/gs,
    '<pre class="bg-gray-800 p-3 rounded-lg my-2 overflow-x-auto"><code class="font-mono text-sm text-green-400">$1</code></pre>'
  );

  formatted = formatted
    .replace(/~~([^~]+)~~/g, '<del class="line-through opacity-75">$1</del>')
    .replace(/~([^~]+)~/g, '<span class="line-through opacity-75">$1</span>');

  formatted = formatted.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');

  formatted = formatted.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-green-400">$1</code>'
  );

  formatted = formatted
    .replace(/\n{2,}/g, '</p><p class="mb-2">')
    .replace(/\n/g, "<br>");

  if (
    !formatted.includes("<h1") &&
    !formatted.includes("<h2") &&
    !formatted.includes("<ul")
  ) {
    formatted = '<p class="mb-2">' + formatted + "</p>";
  } else {
    formatted = formatted.replace(
      /^(?!<h[1-6]|<ul|<li|<pre)(.+)$/gm,
      '<p class="mb-2">$1</p>'
    );
  }

  formatted = formatted
    .replace(/<p[^>]*>(<h[1-6][^>]*>.*<\/h[1-6]>)<\/p>/g, "$1")
    .replace(/<p[^>]*>(<ul[^>]*>.*<\/ul>)<\/p>/gs, "$1")
    .replace(/<p[^>]*>(<pre[^>]*>.*<\/pre>)<\/p>/gs, "$1")
    .replace(/<p[^>]*><\/p>/g, "");

  return formatted;
};
