// app/api/faceswap/route.ts

import { NextResponse, NextRequest } from 'next/server';

async function uploadImageToLightX(file: File, apiKey: string) {
  const baseUrl = 'https://api.lightxeditor.com/external/api/v2';
  const uploadEndpoint = `${baseUrl}/uploadImageUrl`;

  const contentType = file.type;
  const size = file.size;

  try {
    const requestPayload = {
      uploadType: 'imageUrl',
      size: size,
      contentType: contentType,
    };
    // console.log('Upload Request Payload:', JSON.stringify(requestPayload, null, 2));

    const presignedRes = await fetch(uploadEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(requestPayload),
    });

    if (!presignedRes.ok) {
      const errorText = await presignedRes.text();
      console.error('Presigned URL Error Response:', errorText);
      throw new Error(`Failed to get presigned URL: ${presignedRes.status} - ${errorText}`);
    }

    const presignedData = await presignedRes.json();
    // console.log('Presigned URL Response:', JSON.stringify(presignedData, null, 2));

    const responseData = presignedData.body || presignedData.data || presignedData.result || presignedData;
    if (!responseData) {
      throw new Error('Invalid response: no data available');
    }

    // console.log('Extracted Response Data:', JSON.stringify(responseData, null, 2));

    const uploadUrl = responseData.uploadImage || responseData.uploadUrl || responseData.upload_url || responseData.url;
    const imageUrl = responseData.imageUrl || responseData.image_url || responseData.outputUrl;

    if (!uploadUrl) {
      throw new Error(`Invalid response: missing upload URL (available fields: ${Object.keys(responseData).join(', ')})`);
    }

    // console.log('Uploading to presigned URL:', uploadUrl);
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: await file.arrayBuffer(),
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error('Upload Error Response:', errorText);
      throw new Error(`Failed to upload image: ${uploadRes.status} - ${errorText}`);
    }

    if (!imageUrl) {
      throw new Error(`Image URL not provided in presigned response (available fields: ${Object.keys(responseData).join(', ')})`);
    }

    return imageUrl;
  } catch (error: any) {
    console.error('Error in uploadImageToLightX:', error.message, error.stack);
    throw error;
  }
}

async function pollOrderStatus(orderId: string, apiKey: string, maxRetries: number = 10, interval: number = 5000) {
  const statusEndpoint = 'https://api.lightxeditor.com/external/api/v1/order-status';

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // console.log(`Polling attempt ${attempt + 1} for orderId: ${orderId}`);
      const statusRes = await fetch(statusEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ orderId }),
      });

      if (!statusRes.ok) {
        const errorText = await statusRes.text();
        console.error('Status Error Response:', errorText);
        throw new Error(`Failed to check status: ${statusRes.status} - ${errorText}`);
      }

      const statusData = await statusRes.json();
      // console.log('Status Response:', JSON.stringify(statusData, null, 2));

      const responseData = statusData.body || statusData.data || statusData.result || statusData;
      if (!responseData) {
        throw new Error(`Invalid status response: no data available (available fields: ${Object.keys(statusData).join(', ')})`);
      }

      const { status, output, message, description } = responseData;

      if (status === 'active') {
        if (!output) {
          throw new Error('Output URL missing in active status response');
        }
        return output;
      } else if (status === 'failed' || status === 'FAIL') {
        throw new Error(`Face swap processing failed: ${message || 'Unknown error'} - ${description || 'No description provided'}`);
      } else if (status === 'init' && attempt === maxRetries - 1) {
        throw new Error(`Face swap stuck in init status after ${maxRetries} attempts`);
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error: any) {
      console.error('Error in pollOrderStatus:', error.message, error.stack);
      throw error;
    }
  }

  throw new Error(`Max retries (${maxRetries}) exceeded for status polling`);
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_AI_API_Key;
    if (!apiKey) {
      console.error('API key not configured');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }
    // console.log('API Key:', apiKey ? 'Present' : 'Missing');

    const formData = await request.formData();
    const originalFile = formData.get('originalFile') as File;
    const swapFile = formData.get('swapFile') as File;

    if (!originalFile || !swapFile) {
      console.error('Missing files in FormData');
      return NextResponse.json({ error: 'Missing files' }, { status: 400 });
    }

    // console.log('Processing files:', {
    //   originalFile: { name: originalFile.name, type: originalFile.type, size: originalFile.size },
    //   swapFile: { name: swapFile.name, type: swapFile.type, size: swapFile.size },
    // });

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(originalFile.type) || !validTypes.includes(swapFile.type)) {
      console.error('Invalid file types:', { originalFile: originalFile.type, swapFile: swapFile.type });
      return NextResponse.json({ error: 'Invalid file type. Only JPG/PNG allowed.' }, { status: 400 });
    }
    if (originalFile.size > 2 * 1024 * 1024 || swapFile.size > 2 * 1024 * 1024) {
      console.error('File size exceeds limit:', { originalFile: originalFile.size, swapFile: swapFile.size });
      return NextResponse.json({ error: 'File size exceeds 2MB limit' }, { status: 400 });
    }

    // console.log('Uploading original image...');
    const imageUrl = await uploadImageToLightX(originalFile, apiKey);
    // console.log('Uploading style image...');
    const styleImageUrl = await uploadImageToLightX(swapFile, apiKey);
    // console.log('Uploaded image URLs:', { imageUrl, styleImageUrl });

    // console.log('Initiating face swap...');
    const faceSwapEndpoint = 'https://api.lightxeditor.com/external/api/v1/face-swap';
    const faceSwapRes = await fetch(faceSwapEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        imageUrl,
        styleImageUrl,
      }),
    });

    if (!faceSwapRes.ok) {
      const errorText = await faceSwapRes.text();
      // console.error('Face Swap Error Response:', errorText);
      throw new Error(`Face swap API failed: ${faceSwapRes.status} - ${errorText}`);
    }

    const faceSwapData = await faceSwapRes.json();
    // console.log('Face Swap Response:', JSON.stringify(faceSwapData, null, 2));

    const responseData = faceSwapData.body || faceSwapData.data || faceSwapData.result || faceSwapData;
    if (!responseData?.orderId) {
      throw new Error(`Invalid face swap response: missing orderId (available fields: ${Object.keys(responseData).join(', ')})`);
    }

    const { orderId, maxRetriesAllowed, avgResponseTimeInSec } = responseData;

    // console.log('Polling for face swap result...');
    const outputUrl = await pollOrderStatus(orderId, apiKey, maxRetriesAllowed, avgResponseTimeInSec * 1000 / maxRetriesAllowed);

    return NextResponse.json({ imageUrl: outputUrl });
  } catch (error: any) {
    console.error('Error in /api/faceswap:', error.message, error.stack);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}