# deplay the assets

rm -rf ../public/assets
rm -rf ../public/index.html

cp -r ./dist/assets ../public/
cp -r ./dist/index.html ../public/


echo "deploy done"