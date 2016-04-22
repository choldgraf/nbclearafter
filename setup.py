import setuptools

setuptools.setup(
    name="nbclearafter",
    version='0.1.0',
    url="https://github.com/yuvipanda/nbclearafter",
    license="3-Clause BSD"
    author="Yuvi Panda",
    description="Clear output of all cells after currently executed cell",
    packages=setuptools.find_packages(),
    install_requires=[
        'notebook',
    ],
    package_data={'nbclearafter': ['static/*']},
)
