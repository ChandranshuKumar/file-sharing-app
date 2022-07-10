import { model, Schema } from 'mongoose';

export type IFile = {
	path: string;
	originalName: string;
	password?: string;
	downloadCount: number;
};

const FileSchema = new Schema<IFile>({
	path: {
		type: String,
		required: true
	},
	originalName: {
		type: String,
		required: true
	},
	password: String,
	downloadCount: {
		type: Number,
		required: true
	}
});

export const File = model<IFile>('File', FileSchema);
