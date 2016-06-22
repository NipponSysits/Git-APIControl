@echo off
FOR /F "tokens=*" %%D IN ('git ls-tree -l %1') DO (
  git log -1 --format="%%D|%%ci|%%s" -- %%D
)