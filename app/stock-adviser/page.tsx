'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StockTickerSchema } from '@/schemas';
import * as z from 'zod';
import { CardWrapper } from '@/components/card-wrapper';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { useState, useTransition } from 'react';
import { getOpenaiStockAdvise } from '@/actions/openia';
import { getStockAdvise } from '@/actions/huggingface';

const StockAdviserPage = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);

  const form = useForm<z.infer<typeof StockTickerSchema>>({
    resolver: zodResolver(StockTickerSchema),
    defaultValues: {
      ticker: '',
    },
  });

  const onSubmit = (ticker: z.infer<typeof StockTickerSchema>) => {
    setError('');
    setSuccess('');

    console.log('ticker', ticker);

    startTransition(() => {
      getStockAdvise(ticker).then((data) => {
        setError(data.error);
        setSuccess(data.success as string | undefined);
      });
    });
  };

  return (
    <CardWrapper
      headerTitle="Stock Adviser"
      headerLabel="Welcome to the stock adviser"
      backButtonLabel=""
      backButtonHref=""
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="ticker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Ticker Symbol</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter a stock ticker symbol"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />

            <Button type="submit" className="w-full" disabled={isPending}>
              Get Advise
            </Button>
            <div className="text-center">
              <FormSuccess message={success} />
              {success && <audio controls src={success} />}
            </div>
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default StockAdviserPage;
