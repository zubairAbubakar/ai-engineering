export const getCurrentWeather = ({ location: string }) => {
  const weather = {
    location: location,
    temperature: '75',
    unit: 'F',
    forecast: 'sunny',
  };
  return JSON.stringify(weather);
};

export const getLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return JSON.stringify(data);
  } catch (error) {
    console.error(error);
  }
};

export const tools = [
  {
    type: 'function',
    function: ({ location }: { location: any }) => `Weather in ${location}`,
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'Location to get weather for',
        },
        unit: { type: 'string', enum: ['C', 'F'] },
      },
      required: ['location'],
    },
  },
  {
    type: 'function',
    function: () => 'New York City, NY',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];
