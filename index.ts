import express, { Application, Request, Response } from 'express';
import 'dotenv/config';
import multer from 'multer';
import mongoose from 'mongoose';
import { DB_CONFIG } from './config/db';
import { HOST, PORT } from './config/common';
import { isEmpty } from './utils/common';
import { createPasswordHash, comparePassword } from './utils/password';
import { File, type IFile } from './models/File';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const upload = multer({ dest: 'uploads' });

app.get('/', (req: Request, res: Response) => {
	res.status(200).render('index');
});

app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
	const fileData: IFile = {
		path: `${req.file?.path ?? ''}`,
		originalName: `${req.file?.originalname ?? ''}`,
		downloadCount: 0
	};
	if (!isEmpty(req.body.password)) {
		fileData.password = await createPasswordHash(req.body.password);
	}
	const file = await File.create(fileData);
	res.render('index', { fileLink: `${req.headers.origin}/file/${file.id}` });
});

app.route('/file/:id').get(passwordController).post(passwordController);

async function passwordController(req: Request, res: Response) {
	const file = await File.findById(req.params.id);
	if (!file) return;
	if (file.password != null) {
		if (req.body.password == null) {
			res.render('password');
			return;
		}
		if (!(await comparePassword(req.body.password, file.password))) {
			res.render('password', { error: true });
			return;
		}
	}
	file.downloadCount++;
	await file.save();
	res.download(file.path, file.originalName);
}

const connectDBAndStartServer = async (): Promise<void> => {
	try {
		await mongoose.connect(DB_CONFIG.dbUrl, DB_CONFIG.connectionOptions);
		console.log('MongoDB connected successfully');

		app.listen(PORT, HOST, (): void => console.log(`Server started on ${PORT}`));
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
};

connectDBAndStartServer();
