import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

import { PaperPlaneRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

type CardProps = React.ComponentProps<typeof Card>;

function ScratchNote({ className, ...props }: CardProps) {
  return (
    <>
      <div className={cn('h-[400px] w-[380px]', className)} {...props}>
        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle>Note</CardTitle>
            <CardDescription>Take a new note</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-1">
            <Textarea />
            <div className="grid justify-items-end">
              <Button variant="ghost" size="icon">
                <PaperPlaneRight size={32} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="my-2 h-[200px] overflow-auto">
          <div key={1} className="rounded-sm border bg-white p-4 text-sm">
            [content-placeholder]
          </div>
        </div>
      </div>
    </>
  );
}

export default ScratchNote;
