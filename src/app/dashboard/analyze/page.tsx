'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { analyzeMediaAction } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

export default function AnalyzePage() {
    const [result, setResult] = useState<any>(null);

    async function onSubmit(formData: FormData) {
        const res = await analyzeMediaAction(formData);
        setResult(res);
    }

    return (
        <div className="min-h-screen p-8 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-2xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold">Smart Route Analyzer</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Test the Logic</CardTitle>
                        <CardDescription>Enter a URL or text to see where it would be routed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Content Type</Label>
                                <select name="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="TEXT">Text</option>
                                    <option value="IMAGE">Image</option>
                                    <option value="VIDEO">Video</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Content URL / Text</Label>
                                <Input name="url" placeholder="https://..." />
                            </div>

                            <Button type="submit">Analyze</Button>
                        </form>
                    </CardContent>
                </Card>

                {result && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Result</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <span className="font-bold">Detected Type:</span>
                                    <Badge>{result.type}</Badge>
                                </div>
                                <div>
                                    <span className="font-bold block mb-2">Target Platforms:</span>
                                    <div className="flex gap-2 flex-wrap">
                                        {result.platforms.map((p: string) => (
                                            <Badge key={p} variant="secondary">{p}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
