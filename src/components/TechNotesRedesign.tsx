// src/components/TechNotesRedesign.tsx
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Clock,
  Code,
  FileText,
  BookOpen,
  Tags,
  LayoutGrid,
  ListFilter,
} from 'lucide-react';

// Define types for our tech notes data
interface TechNote {
  id: string;
  title: string;
  description: string;
  dateString: string;
  readingTime: string;
  category: string;
  type: string;
  tags: string[];
}

interface TechNotesRedesignProps {
  techNotes: TechNote[];
  allCategories: string[];
  allTags: string[];
}

// Helper function to get icon for post type
const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'guide':
      return <BookOpen className="h-4 w-4" />;
    case 'tutorial':
      return <FileText className="h-4 w-4" />;
    case 'snippet':
      return <Code className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

// Get background color for tags with softer colors
const getTagColor = (tag: string) => {
  // Create a simple hash of the tag string
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Define a set of background colors with more subtle, pastel tones
  const colors = [
    'bg-gray-100',
    'bg-blue-50',
    'bg-green-50',
    'bg-yellow-50',
    'bg-red-50',
    'bg-indigo-50',
    'bg-purple-50',
    'bg-pink-50',
    'bg-orange-50',
    'bg-teal-50',
    'bg-cyan-50',
    'bg-lime-50',
    'bg-amber-50',
    'bg-emerald-50',
    'bg-violet-50',
  ];

  // Return a consistent color for the same tag
  return colors[Math.abs(hash) % colors.length];
};

export default function TechNotesRedesign({
  techNotes,
  allCategories,
  allTags,
}: TechNotesRedesignProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [viewMode, setViewMode] = useState('comfortable'); // 'comfortable' or 'compact'
  const [sidebarVisible, setSidebarVisible] = useState(true); // For narrow screens

  // Filter notes based on selected category and tag
  const filteredNotes = techNotes.filter((note) => {
    const categoryMatch =
      !selectedCategory || note.category === selectedCategory;
    const tagMatch = !selectedTag || note.tags.includes(selectedTag);
    return categoryMatch && tagMatch;
  });

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedTag('');
  };

  // Toggle between compact and comfortable view
  const toggleViewMode = () => {
    setViewMode(viewMode === 'comfortable' ? 'compact' : 'comfortable');
  };

  // Toggle sidebar visibility on smaller screens
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Mobile sidebar toggle */}
      <div className="flex items-center justify-between border-b bg-gray-50 p-3 md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSidebar}
          className="text-gray-600"
        >
          {sidebarVisible ? 'Hide Filters' : 'Show Filters'}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleViewMode}
            className="text-gray-600"
          >
            {viewMode === 'comfortable' ? (
              <ListFilter className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Sidebar - lighter design */}
      <div
        className={`w-full border-r bg-gray-50 p-4 md:w-56 ${!sidebarVisible ? 'hidden' : 'block'} md:block`}
      >
        <div className="mb-4">
          <h2 className="mb-1 text-base font-medium text-gray-700">
            Tech Notes
          </h2>
          <p className="text-xs text-gray-500">
            Development guides, tutorials, and technical documentation
          </p>
        </div>

        <Separator className="my-3" />

        {/* Only show view options in desktop sidebar */}
        <div className="mb-4 hidden md:block">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-xs font-medium text-gray-600">View Options</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleViewMode}
              className="h-6 w-6 p-0 text-gray-500"
            >
              {viewMode === 'comfortable' ? (
                <ListFilter className="h-3 w-3" />
              ) : (
                <LayoutGrid className="h-3 w-3" />
              )}
            </Button>
          </div>
          <div className="mt-1 flex gap-1">
            <Button
              variant={viewMode === 'comfortable' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('comfortable')}
              className="h-6 px-2 text-xs font-normal"
            >
              Comfortable
            </Button>
            <Button
              variant={viewMode === 'compact' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('compact')}
              className="h-6 px-2 text-xs font-normal"
            >
              Compact
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="mb-1 text-xs font-medium text-gray-600">
              Categories
            </h3>
            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory('')}
                className="h-5 px-1 text-xs text-gray-500"
              >
                Clear
              </Button>
            )}
          </div>
          <ScrollArea className="h-28">
            <div className="space-y-0.5">
              {allCategories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? 'secondary' : 'ghost'
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`h-6 w-full justify-start px-2 text-xs ${selectedCategory === category ? 'font-medium' : 'font-normal'} ${selectedCategory === category ? 'text-gray-800' : 'text-gray-600'}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="mb-1 text-xs font-medium text-gray-600">Tags</h3>
            {selectedTag && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTag('')}
                className="h-5 px-1 text-xs text-gray-500"
              >
                Clear
              </Button>
            )}
          </div>
          <ScrollArea className="h-36">
            <div className="flex flex-wrap gap-1">
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                  className={`mb-1 h-5 px-2 py-0 text-xs ${selectedTag === tag ? 'font-medium' : 'font-normal'} ${selectedTag === tag ? 'text-gray-800' : 'text-gray-600'}`}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {(selectedCategory || selectedTag) && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-7 w-full text-xs text-gray-600"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 bg-white p-4 md:p-5">
        {/* Header with result count */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Tech Notes</h1>
            <p className="mt-1 text-xs text-gray-500">
              {filteredNotes.length}{' '}
              {filteredNotes.length === 1 ? 'article' : 'articles'}
              {selectedCategory && ` in ${selectedCategory}`}
              {selectedTag && ` tagged with "${selectedTag}"`}
            </p>
          </div>
        </div>

        {/* Results grid */}
        <div
          className={`grid gap-3 ${viewMode === 'comfortable' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}
        >
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className={`overflow-hidden border-gray-200 transition-colors hover:border-gray-300 ${viewMode === 'comfortable' ? 'mb-3' : 'mb-2'}`}
            >
              {viewMode === 'comfortable' ? (
                <>
                  <CardHeader className="pb-3">
                    <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        {getTypeIcon(note.type)}
                        <span className="capitalize">{note.type}</span>
                      </div>
                      <span>•</span>
                      <div>{note.dateString}</div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {note.readingTime}
                      </div>
                    </div>
                    <CardTitle className="text-lg font-medium text-gray-900 transition-colors hover:text-gray-700">
                      <a href={`/technotes/${note.id}/`}>{note.title}</a>
                    </CardTitle>
                    <CardDescription className="mt-1 line-clamp-2 text-gray-600">
                      {note.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="mt-1 flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-normal text-gray-700 ${getTagColor(tag)}`}
                          onClick={() => setSelectedTag(tag)}
                          style={{ cursor: 'pointer' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="p-3">
                  <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                    {getTypeIcon(note.type)}
                    <span className="capitalize">{note.dateString}</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 transition-colors hover:text-gray-700">
                    <a href={`/technotes/${note.id}/`}>{note.title}</a>
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {note.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs text-gray-600 ${getTagColor(tag)}`}
                        onClick={() => setSelectedTag(tag)}
                        style={{ cursor: 'pointer' }}
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 2 && (
                      <span className="inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs text-gray-500">
                        +{note.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="mt-2 rounded-lg bg-gray-50 py-10 text-center">
            <h3 className="text-base font-medium text-gray-700">
              No results found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters
            </p>
            <Button
              variant="outline"
              className="mt-3 text-sm"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Back to top button - only show when scrolled down */}
        <div className="fixed right-4 bottom-4">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-full bg-white p-0 text-gray-600 shadow-sm"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
