# Mad Chatter

Mad Chatter is a primarily offline based chatbot management tool, enabling anybody to configure custom AI pipelines and
visual elements to interact with.

It combines large language models, knowledge retrieval, speech recognition, text-to-speech synthesis, and interactive
video responses into a single local system. Unlike cloud based assistants, Mad Chatter runs entirely offline, keeping
all models and data on your own machine.

## Usage

To use Mad Chatter, you can either download one of the releases for your OS, or build a version yourself from source.

For more instructions on how to do this checkout the docs :D.

## Documentation

For installation instructions, configuration guides, and usage details, see the
documentation [here](https://madchatter.pages.dev).

## Features

- **Fully offline**  
  No cloud services or external APIs are required to run.
- **Run Local conversations**  
  Run large language models locally using Ollama.
- **Voice interaction**  
  Use faster-whisper and piper interact with LLM's via speech.
- **Knowledge based answers**  
  Connect custom knowledge for LLMs to use.
- **Interactive video responses**  
  Match user responses to specific videos and attach specific behavior.
- **Configuration options**  
  Customize AI agents, projects, models, languages, and interaction behavior.

## Requirements

Recommended:

- Runs on Windows, Linux, or macOS
- Ollama is installed
- NVIDIA GPU support (recommended, faster-whisper only supports cuda instruction sets)
- Storage space for local AI models

Performance depends on the selected language model, speech recognition model, and available hardware.

## Supported Models

Mad Chatter local AI models that fit the following:

- **LLM:** Ollama compatible models
- **STT:** Only faster-whisper is currently supported
- **TTS:** Only Piper is supported (but any Piper compatible models with a sample rate of **22,050** Hz can be used)
- **Embeddings:** Only `jina/jina-embeddings-v2-base-de` is supported for english and german usage
