# Secret Safety

`.env.benchmark.local` is ignored and checked with Git. The exact local API key was searched for outside that file; zero persistent matches were found. The adapter redacts `Authorization`, does not write request headers or environment dumps, and private raw artifacts are under ignored `tools/benchmarks/thinkai-feedback/private/`.
