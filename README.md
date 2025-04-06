# Trumpet Fingering Helper

My 5th grader got a trumpet at school. He really enjoys learning new songs, but without deeper music theory or sheet-music-reading experience, picking out a new song is a painstaking process of chart lookups and hand-writing notation for him.

So we built a simple, interactive web-based tool for beginner trumpet players. You can select a key signature, click notes on a musical staff, hear the pitch, and see the standard trumpet fingering illustrated visually in one go.

## Usage

(Link to deployed application will go here once available)

You can serve this from any domain; to run locally you'll need to run through an HTTP server due to limitations of `file` urls. Try running `npx serve` for the easiest way to run it locally.

## Development

The [spec](docs/spec.md) and [todo](docs/todo.md) was written in a prompt-based conversation with Gemini Pro 2.5. Nearly the entire resulting product was vibe-coded through pointing Aider with Gemini Pro 2.5 at the TODO files and telling it to keep working on its todos. ([prompts](docs/prompts.md) was LLM-generated during the spec/todo process, but in practice Aider did a good enough job that it wasn't used directly).

The result is a static web application built with HTML, CSS, and vanilla JavaScript.

## Attribution

*   **Trumpet Samples:** Provided by [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments) by Nicholaus P. Brosowsky (MIT License).
*   **Audio Engine:** [Tone.js](https://tonejs.github.io/) (MIT License).
*   **Trumpet SVG:** Based on image from [SVG Repo](https://www.svgrepo.com/svg/190518/trumpet) (CC0 / public domain).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
