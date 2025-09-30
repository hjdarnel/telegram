import { type PipelineType, pipeline } from "@xenova/transformers";

// Set environment variables to control ONNX threading and prevent affinity errors
if (typeof process !== "undefined" && process.env) {
	process.env.OMP_NUM_THREADS = "1";
	process.env.MKL_NUM_THREADS = "1";
	process.env.OPENBLAS_NUM_THREADS = "1";
	process.env.VECLIB_MAXIMUM_THREADS = "1";
	process.env.NUMEXPR_NUM_THREADS = "1";
}

// Use the Singleton pattern to enable lazy construction of the pipeline.
class PipelineSingleton {
	static task: PipelineType = "text-classification";
	static model = "Xenova/toxic-bert";
	static instance: any = null;

	static async getInstance(progress_callback?: Function) {
		if (this.instance === null) {
			this.instance = pipeline(this.task, this.model, { progress_callback });
		}
		return this.instance;
	}
}

// In development, preserve the instance across hot reloads
if (process.env.NODE_ENV !== "production") {
	// When running in development mode, attach the pipeline to the
	// global object so that it's preserved between hot reloads.
	// For more information, see https://vercel.com/guides/nextjs-prisma-postgres
	if (!(global as any).PipelineSingleton) {
		(global as any).PipelineSingleton = PipelineSingleton;
	}
}

export default PipelineSingleton;
