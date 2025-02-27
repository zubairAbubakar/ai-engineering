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
import { useEffect, useState, useTransition } from 'react';
import { getDetector } from '@/actions/huggingface';

interface ImaageDetectorPageProps {}

const ImageDetectorPage: React.FC<ImaageDetectorPageProps> = async () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);

  let image: HTMLImageElement | null = null;
  let status: HTMLElement | null = null;
  let imageContainer: HTMLElement | null = null;

  useEffect(() => {
    status = document.getElementById('status');
    image = document.getElementById('image') as HTMLImageElement;
    const detectObjectsButton = document.getElementById('detect-objects');
    imageContainer = document.getElementById('image-container');

    // Create a new object detection pipeline
    status!.textContent = 'Loading model...';

    // Enable Object Detection
    // detectObjectsButton!.addEventListener('click', detectAndDrawObjects);
    // detectObjectsButton!.disabled = false;
    status!.textContent = 'Ready';

    // Your logic here
  }, []);

  const detector = await getDetector();

  const detectAndDrawObjects = async () => {
    // Detect Objects
    status!.textContent = 'Detecting...';
    const detectedObjects = await detector(image!.src, {
      threshold: 0.95,
      percentage: true,
    });

    // Draw Detected Objects
    status!.textContent = 'Drawing...';
    detectedObjects.forEach((obj) => {
      drawObjectBox(obj);
    });

    status!.textContent = 'Done!';
  };

  // Helper function that draws boxes for every detected object in the image
  // ⚠️ ️This function requires box coordinates to be in percentages  ️
  const drawObjectBox = (detectedObject: any) => {
    const { label, score, box } = detectedObject;
    const { xmax, xmin, ymax, ymin } = box;

    // Generate a random color for the box
    const color =
      '#' +
      Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, '0');

    // Draw the box
    const boxElement = document.createElement('div');
    boxElement.className = 'bounding-box';
    Object.assign(boxElement.style, {
      borderColor: color,
      left: 100 * xmin + '%',
      top: 100 * ymin + '%',
      width: 100 * (xmax - xmin) + '%',
      height: 100 * (ymax - ymin) + '%',
    });

    // Draw label
    const labelElement = document.createElement('span');
    labelElement.textContent = `${label}: ${Math.floor(score * 100)}%`;
    labelElement.className = 'bounding-box-label';
    labelElement.style.backgroundColor = color;

    boxElement.appendChild(labelElement);
    imageContainer!.appendChild(boxElement);
  };

  return (
    <CardWrapper
      headerTitle="Image Detector"
      headerLabel="Welcome to the Image Detector"
      backButtonLabel=""
      backButtonHref=""
    >
      <div className="space-y-4">
        <img id="image" src="street1.jpg" />

        <Button
          onClick={detectAndDrawObjects}
          className="w-full"
          disabled={isPending}
        >
          Get Advise
        </Button>
      </div>
    </CardWrapper>
  );
};

export default ImageDetectorPage;
