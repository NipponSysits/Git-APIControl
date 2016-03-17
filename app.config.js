module.exports = ({
	dev: {
		git: 810,
		api: 811,
		mysql: {
			host: 'pgm.ns.co.th',
			user: 'root',
			port: 33061,
			password: '123456',
			database: 'ns_develop'
		},
		core: 'C:/Program Files/Git/mingw64/libexec/git-core',
		lfs: 'C:/Program Files/Git LFS'
	},
	serv: {
		git: 810,
		api: 820,
		mysql: {
			host: 'localhost',
			user: 'root',
			port: 3306,
			password: '123456',
			database: 'ns_dev'
		},
		core: 'C:/Program Files/Git/mingw64/libexec/git-core',
		lfs: 'C:/Program Files/Git LFS'
	}
})[(/--(\w+)/.exec(process.argv[2] || '--serv') || ['', 'serv'])[1]]