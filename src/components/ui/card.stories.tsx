import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";
import { Button } from "./button";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Hook Score</CardTitle>
        <CardDescription>Rated against viral patterns as you type.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-on-surface-variant">
          LUNVO scans your first line and scores its stop-scroll power out of ten.
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" size="sm">
          Skip
        </Button>
        <Button size="sm">Run Analysis</Button>
      </CardFooter>
    </Card>
  ),
};

export const Plain: Story = {
  render: () => (
    <Card className="w-[300px] p-6">
      <p className="text-sm text-on-background">Minimal card with only body content.</p>
    </Card>
  ),
};
