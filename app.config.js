module.exports = ({
	dev: {
		run: 'dev',
		domain: 'localhost',
		git: 8100,
		api: 8200,
		mysql: {
			host: 'pgm.ns.co.th',
			user: 'root',
			port: 33061,
			password: '123456',
			database: 'ns_develop'
		},
		path: './tmp',
		core: 'C:/Program Files/Git/mingw64/libexec/git-core',
		lfs: 'C:/Program Files/Git LFS'
	},
	serv: {
		run: 'serv',
		domain: 'dev.ns.co.th',
		git: 810,
		api: 820,
		mysql: {
			host: 'localhost',
			user: 'root',
			port: 3306,
			password: '123456',
			database: 'ns_dev'
		},
		path: '/data/source-code',
		core: 'C:/Program Files/Git/mingw64/libexec/git-core',
		lfs: 'C:/Program Files/Git LFS'
	}
})[(/--(\w+)/.exec(process.argv[2] || '--serv') || ['', 'serv'])[1]]